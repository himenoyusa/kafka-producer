// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use app::{send_data, Config};

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![sink_kafka])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn sink_kafka(data: Config) -> String {
    let result = send_data(data).await;

    match result {
        app::ResultType::Success(msg) => msg,
        app::ResultType::Failed(msg) => msg,
    }
}
