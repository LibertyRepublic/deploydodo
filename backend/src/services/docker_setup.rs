use crate::connectors::SshSessionOps;
use crate::error::AppError;

pub async fn verify_docker_runtime(
    session: &dyn SshSessionOps,
    retry_after_install: bool,
) -> Result<(), AppError> {
    let docker_status = session.check_docker().await?;
    if docker_status.is_installed {
        let is_docker_installed_via_snap = session.is_docker_installed_via_snap().await?;
        if is_docker_installed_via_snap {
            session.disconnect().await?;
            return Err(AppError::Validation(
                "Docker runtime is present but it was installed via snap. \
                 Please remove the snap installation and use the system package manager instead."
                    .into(),
            ));
        }
        if !docker_status.is_running {
            session.disconnect().await?;
            return Err(AppError::Validation(
                "Docker runtime is installed but not running".into(),
            ));
        }
        Ok(())
    } else {
        install_docker(session).await?;
        if retry_after_install {
            Box::pin(verify_docker_runtime(session, false)).await?;
        }
        Ok(())
    }
}

async fn install_docker(session: &dyn SshSessionOps) -> Result<(), AppError> {
    let output = session
        .run_command("curl -fsSL https://get.docker.com -o get-docker.sh")
        .await?;

    if output.exit_code != 0 {
        return Err(AppError::Validation(format!(
            "Failed to download Docker installation script: {}",
            output.stdout
        )));
    }

    let output = session.run_command("sh get-docker.sh").await?;

    if session.run_command("rm get-docker.sh").await.is_err() {
        tracing::warn!("failed to remove get-docker.sh from remote server");
    }

    if output.exit_code != 0 {
        return Err(AppError::Validation(format!(
            "Failed to install Docker: {}",
            output.stdout
        )));
    }

    Ok(())
}
