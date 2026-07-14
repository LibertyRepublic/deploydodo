use std::sync::Arc;

use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::{prelude::FromRow, PgPool};

use crate::error::AppResult;

pub trait VariableValueByKey {
    fn get_boolean(&self, key: VariableKey) -> Option<bool>;
}

#[derive(Debug, sqlx::Type, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
#[sqlx(type_name = "TEXT", rename_all = "snake_case")]
pub enum VariableKey {
    IsAdminOnboarded,
    IsServerSetup,
    IsLocalServerSetup,
    IsProjectSetup,
}

#[derive(Debug, FromRow)]
pub struct Variable {
    pub name: String,
    pub value: String,
}

impl VariableValueByKey for Vec<Variable> {
    fn get_boolean(&self, key: VariableKey) -> Option<bool> {
        let key_literal: String = key.serialize(VariableKeySerializer).ok()?;
        self.iter().find_map(move |var| {
            if key_literal == var.name.as_str() {
                var.value.parse::<bool>().ok()
            } else {
                None
            }
        })
    }
}

pub struct VariablesService {
    db: Arc<PgPool>,
}

impl VariablesService {
    pub fn new(db: Arc<PgPool>) -> Self {
        Self { db }
    }

    pub async fn get_all(&self, keys: Vec<VariableKey>) -> AppResult<Vec<Variable>> {
        Ok(
            sqlx::query_as("SELECT name, value FROM variables WHERE name = ANY($1)")
                .bind(keys)
                .fetch_all(&*self.db)
                .await?,
        )
    }

    async fn set(&self, name: &str, value: String) -> AppResult<()> {
        sqlx::query(
            "INSERT INTO variables (name, value, created_at) VALUES ($1, $2, $3)
             ON CONFLICT(name) DO UPDATE SET value = excluded.value",
        )
        .bind(name)
        .bind(value)
        .bind(Utc::now())
        .execute(&*self.db)
        .await?;

        Ok(())
    }

    pub async fn set_value<V: ToString>(&self, name: &str, value: V) -> AppResult<()> {
        self.set(name, value.to_string()).await
    }
}

use serde::ser::{Error, Impossible, Serializer};

struct VariableKeySerializer;

impl Serializer for VariableKeySerializer {
    type Ok = String;
    type Error = std::fmt::Error;
    type SerializeSeq = Impossible<Self::Ok, Self::Error>;
    type SerializeTuple = Impossible<Self::Ok, Self::Error>;
    type SerializeTupleStruct = Impossible<Self::Ok, Self::Error>;
    type SerializeTupleVariant = Impossible<Self::Ok, Self::Error>;
    type SerializeMap = Impossible<Self::Ok, Self::Error>;
    type SerializeStruct = Impossible<Self::Ok, Self::Error>;
    type SerializeStructVariant = Impossible<Self::Ok, Self::Error>;

    fn serialize_str(self, _v: &str) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize str"))
    }
    fn serialize_unit_struct(self, _name: &'static str) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize unit struct"))
    }
    fn serialize_unit_variant(
        self,
        _name: &'static str,
        _variant_index: u32,
        variant: &'static str,
    ) -> Result<Self::Ok, Self::Error> {
        Ok(variant.to_owned())
    }
    fn serialize_bool(self, _v: bool) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize bool"))
    }
    fn serialize_i8(self, _v: i8) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize i8"))
    }
    fn serialize_i16(self, _v: i16) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize i16"))
    }
    fn serialize_i32(self, _v: i32) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize i32"))
    }
    fn serialize_i64(self, _v: i64) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize i64"))
    }
    fn serialize_i128(self, _v: i128) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize i128"))
    }
    fn serialize_u8(self, _v: u8) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize u8"))
    }
    fn serialize_u16(self, _v: u16) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize u16"))
    }
    fn serialize_u32(self, _v: u32) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize u32"))
    }
    fn serialize_u64(self, _v: u64) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize u64"))
    }
    fn serialize_u128(self, _v: u128) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize u128"))
    }
    fn serialize_f32(self, _v: f32) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize f32"))
    }
    fn serialize_f64(self, _v: f64) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize f64"))
    }
    fn serialize_char(self, _v: char) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize char"))
    }
    fn serialize_bytes(self, _v: &[u8]) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize bytes"))
    }
    fn serialize_none(self) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize none"))
    }
    fn serialize_some<T>(self, _value: &T) -> Result<Self::Ok, Self::Error>
    where
        T: ?Sized + Serialize,
    {
        Err(Self::Error::custom("cannot serialize some"))
    }
    fn serialize_unit(self) -> Result<Self::Ok, Self::Error> {
        Err(Self::Error::custom("cannot serialize unit"))
    }
    fn serialize_newtype_struct<T>(
        self,
        _name: &'static str,
        _value: &T,
    ) -> Result<Self::Ok, Self::Error>
    where
        T: ?Sized + Serialize,
    {
        Err(Self::Error::custom("cannot serialize newtype struct"))
    }
    fn serialize_newtype_variant<T>(
        self,
        _name: &'static str,
        _variant_index: u32,
        _variant: &'static str,
        _value: &T,
    ) -> Result<Self::Ok, Self::Error>
    where
        T: ?Sized + Serialize,
    {
        Err(Self::Error::custom("cannot serialize newtype variant"))
    }
    fn serialize_seq(self, _len: Option<usize>) -> Result<Self::SerializeSeq, Self::Error> {
        Err(Self::Error::custom("cannot serialize seq"))
    }
    fn serialize_tuple(self, _len: usize) -> Result<Self::SerializeTuple, Self::Error> {
        Err(Self::Error::custom("cannot serialize tuple"))
    }
    fn serialize_tuple_struct(
        self,
        _name: &'static str,
        _len: usize,
    ) -> Result<Self::SerializeTupleStruct, Self::Error> {
        Err(Self::Error::custom("cannot serialize tuple struct"))
    }
    fn serialize_tuple_variant(
        self,
        _name: &'static str,
        _variant_index: u32,
        _variant: &'static str,
        _len: usize,
    ) -> Result<Self::SerializeTupleVariant, Self::Error> {
        Err(Self::Error::custom("cannot serialize tuple variant"))
    }
    fn serialize_map(self, _len: Option<usize>) -> Result<Self::SerializeMap, Self::Error> {
        Err(Self::Error::custom("cannot serialize map"))
    }
    fn serialize_struct(
        self,
        _name: &'static str,
        _len: usize,
    ) -> Result<Self::SerializeStruct, Self::Error> {
        Err(Self::Error::custom("cannot serialize struct"))
    }
    fn serialize_struct_variant(
        self,
        _name: &'static str,
        _variant_index: u32,
        _variant: &'static str,
        _len: usize,
    ) -> Result<Self::SerializeStructVariant, Self::Error> {
        Err(Self::Error::custom("cannot serialize struct variant"))
    }
}
