pub enum CdAction {
    Change { new_dir: String },
    NoOp,
}

pub fn resolve_cd(current_dir: &str, cmd_trimmed: &str) -> CdAction {
    match cmd_trimmed {
        "cd" | "cd ~" => {
            CdAction::Change {
                new_dir: String::from("/root"),
            }
        }
        "cd /" => {
            CdAction::Change {
                new_dir: String::from("/"),
            }
        }
        "cd .." => resolve_parent_dir(current_dir),
        _ if cmd_trimmed.starts_with("cd ") => {
            resolve_cd_target(current_dir, cmd_trimmed)
        }
        _ => CdAction::NoOp,
    }
}

fn resolve_parent_dir(current_dir: &str) -> CdAction {
    let mut new_dir = String::from("/");
    if let Some(parent) = std::path::Path::new(current_dir).parent() {
        let parent_str = parent.to_string_lossy().to_string();
        if !parent_str.is_empty() {
            new_dir = parent_str;
        }
    }
    CdAction::Change { new_dir }
}

fn resolve_cd_target(current_dir: &str, cmd_trimmed: &str) -> CdAction {
    let target = cmd_trimmed
        .strip_prefix("cd ")
        .unwrap()
        .trim()
        .trim_matches('"')
        .trim_matches('\'');

    if target == ".." {
        return resolve_parent_dir(current_dir);
    }

    let new_dir = if target.starts_with('/') {
        target.to_string()
    } else {
        format!(
            "{}/{}",
            current_dir.trim_end_matches('/'),
            target
        )
    };

    CdAction::Change { new_dir }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resolve_cd_bare_cd_goes_to_root() {
        match resolve_cd("/some/dir", "cd") {
            CdAction::Change { new_dir } => assert_eq!(new_dir, "/root"),
            CdAction::NoOp => panic!("expected Change"),
        }
    }

    #[test]
    fn resolve_cd_tilde_goes_to_root() {
        match resolve_cd("/some/dir", "cd ~") {
            CdAction::Change { new_dir } => assert_eq!(new_dir, "/root"),
            CdAction::NoOp => panic!("expected Change"),
        }
    }

    #[test]
    fn resolve_cd_slash_goes_to_root() {
        match resolve_cd("/some/dir", "cd /") {
            CdAction::Change { new_dir } => assert_eq!(new_dir, "/"),
            CdAction::NoOp => panic!("expected Change"),
        }
    }

    #[test]
    fn resolve_cd_dotdot_goes_to_parent() {
        match resolve_cd("/foo/bar/baz", "cd ..") {
            CdAction::Change { new_dir } => assert_eq!(new_dir, "/foo/bar"),
            CdAction::NoOp => panic!("expected Change"),
        }
    }

    #[test]
    fn resolve_cd_dotdot_from_root_stays_root() {
        match resolve_cd("/", "cd ..") {
            CdAction::Change { new_dir } => assert_eq!(new_dir, "/"),
            CdAction::NoOp => panic!("expected Change"),
        }
    }

    #[test]
    fn resolve_cd_relative_subdir() {
        match resolve_cd("/app", "cd src") {
            CdAction::Change { new_dir } => assert_eq!(new_dir, "/app/src"),
            CdAction::NoOp => panic!("expected Change"),
        }
    }

    #[test]
    fn resolve_cd_absolute_path() {
        match resolve_cd("/app", "cd /etc/nginx") {
            CdAction::Change { new_dir } => assert_eq!(new_dir, "/etc/nginx"),
            CdAction::NoOp => panic!("expected Change"),
        }
    }

    #[test]
    fn resolve_noop_for_non_cd_command() {
        match resolve_cd("/app", "ls -la") {
            CdAction::NoOp => {}
            CdAction::Change { .. } => panic!("expected NoOp"),
        }
    }

    #[test]
    fn resolve_cd_quoted_path() {
        match resolve_cd("/tmp", "cd \"my data\"") {
            CdAction::Change { new_dir } => assert_eq!(new_dir, "/tmp/my data"),
            CdAction::NoOp => panic!("expected Change"),
        }
    }
}
