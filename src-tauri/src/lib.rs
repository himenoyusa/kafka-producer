use rdkafka::{
    producer::{FutureProducer, FutureRecord},
    ClientConfig,
};
use serde::Deserialize;
use std::time::Duration;

#[derive(Deserialize, Debug)]
pub struct Config {
    value: String,
    servers: String,
    partition: i32,
    key: Option<String>,
    topic: String,
}

pub enum ResultType {
    Success(String),
    Failed(String),
}

pub async fn send_data(params: Config) -> ResultType {
    let producer_res = ClientConfig::new()
        .set("bootstrap.servers", &params.servers)
        .set("message.timeout.ms", "5000")
        .create();
    if let Err(_) = producer_res {
        return ResultType::Failed(String::from("Kafka 连接失败！"));
    }
    let producer: FutureProducer = producer_res.unwrap();

    let res = producer
        .send(
            FutureRecord::to(&params.topic)
                .partition(params.partition)
                .key(&params.key.unwrap_or("".to_string()))
                .payload(&params.value),
            Duration::from_secs(0),
        )
        .await;

    match res {
        Ok(_) => ResultType::Success(String::from("发送成功！")),
        Err(msg) => ResultType::Failed(String::from(format!("发送失败！原因：{:?}", msg.1))),
    }
}
