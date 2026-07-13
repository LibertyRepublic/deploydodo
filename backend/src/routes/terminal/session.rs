use dodosh::{terminal, SshTimeout};

use crate::dependencies::Dependencies;
use crate::error::AppResult;
use crate::routes::terminal::TerminalParams;

pub async fn terminal_init(
    server_id: i64,
    params: TerminalParams,
    deps: &Dependencies,
) -> AppResult<terminal::Terminal> {
    let server = deps.server_service.get_server_by_id(server_id).await?;

    let ssh_key = deps.ssh_service.get_key_for_server(&server).await?;

    let timeout_config = SshTimeout::builder()
        .inactivity_secs(60)
        .keepalive_secs(30)
        .build();

    if let Some(ref container_name) = params.container_name.clone() {
        let server_type = server.server_type();

        if server_type.is_local() {
            Ok(terminal::connect_docker_local(container_name, params.into()).await?)
        } else {
            Ok(terminal::connect_docker_remote(
                server.hostname().as_ref(),
                server.ssh_port(),
                ssh_key.username(),
                (&ssh_key).into(),
                container_name,
                params.into(),
                timeout_config,
            )
            .await?)
        }
    } else {
        Ok(terminal::connect_host(
            server.hostname().as_ref(),
            server.ssh_port(),
            ssh_key.username(),
            (&ssh_key).into(),
            params.into(),
            SshTimeout::keepalive_secs(30),
        )
        .await?)
    }
}
