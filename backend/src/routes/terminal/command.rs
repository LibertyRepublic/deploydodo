pub fn build_command(current_dir: &str, user_cmd: &str) -> String {
    if user_cmd.trim().is_empty() {
        return format!("cd {} && true", shell_escape(current_dir));
    }

    format!(
        "{setup} && {user_cmd}",
        setup = format!(
            "cd {} && export TERM=xterm-256color CLICOLOR_FORCE=1 && ls() {{ command ls -C --color=always \"$@\"; }}",
            shell_escape(current_dir),
        ),
        user_cmd = user_cmd,
    )
}

pub fn shell_escape(s: &str) -> String {
    format!("'{}'", s.replace('\'', "'\\''"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn build_command_empty_cmd_runs_true_in_directory() {
        let cmd = build_command("/app", "");
        assert!(cmd.contains("cd '/app'"));
        assert!(cmd.contains("&& true"));
    }

    #[test]
    fn build_command_sets_term_and_clicolor() {
        let cmd = build_command("/app", "echo hi");
        assert!(cmd.contains("TERM=xterm-256color"));
        assert!(cmd.contains("CLICOLOR_FORCE=1"));
        assert!(cmd.contains("echo hi"));
    }

    #[test]
    fn build_command_cd_to_directory() {
        let cmd = build_command("/var/log", "ls");
        assert!(cmd.contains("cd '/var/log'"));
    }

    #[test]
    fn shell_escape_simple_string() {
        assert_eq!(shell_escape("hello"), "'hello'");
    }

    #[test]
    fn shell_escape_string_with_single_quote() {
        assert_eq!(shell_escape("it's"), "'it'\\''s'");
    }

    #[test]
    fn shell_escape_empty_string() {
        assert_eq!(shell_escape(""), "''");
    }
}
