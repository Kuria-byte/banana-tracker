# Database Schema
| Schema | Table | Column | Type | Nullable | Default | Primary |
|--------|-------|--------|------|----------|---------|---------|
| neon_auth | users_sync | raw_json | jsonb | NO |  |  |
| neon_auth | users_sync | id | text | NO | (raw_json ->> 'id'::text) | ✅ |
| neon_auth | users_sync | name | text | YES | (raw_json ->> 'display_name'::text) |  |
| neon_auth | users_sync | email | text | YES | (raw_json ->> 'primary_email'::text) |  |
| neon_auth | users_sync | created_at | timestamp with time zone | YES | to_timestamp((trunc((((raw_json ->> 'signed_up_at_millis'::text))::bigint)::double precision) / (1000)::double precision)) |  |
| neon_auth | users_sync | updated_at | timestamp with time zone | YES |  |  |
| neon_auth | users_sync | deleted_at | timestamp with time zone | YES |  |  |
| neon_auth | users_sync_deleted_at_idx | deleted_at | timestamp with time zone | YES |  |  |
| neon_auth | users_sync_pkey | id | text | YES |  |  |
| pg_toast | pg_toast_1213 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_1213 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_1213 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_1213_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_1213_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_1247 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_1247 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_1247 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_1247_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_1247_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_1255 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_1255 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_1255 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_1255_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_1255_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_1260 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_1260 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_1260 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_1260_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_1260_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_1262 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_1262 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_1262 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_1262_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_1262_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_13377 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_13377 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_13377 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_13377_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_13377_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_13382 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_13382 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_13382 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_13382_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_13382_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_13387 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_13387 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_13387 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_13387_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_13387_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_13392 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_13392 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_13392 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_13392_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_13392_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_1417 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_1417 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_1417 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_1417_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_1417_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_1418 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_1418 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_1418 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_1418_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_1418_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2328 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2328 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2328 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_2328_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2328_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2396 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2396 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2396 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_2396_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2396_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24622 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24622 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24622 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_24622_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24622_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24637 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24637 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24637 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_24637_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24637_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24656 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24656 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24656 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_24656_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24656_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24675 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24675 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24675 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_24675_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24675_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24703 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24703 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24703 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_24703_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24703_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24724 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24724 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24724 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_24724_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24724_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24751 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24751 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24751 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_24751_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24751_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24768 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24768 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24768 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_24768_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24768_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24810 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24810 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24810 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_24810_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24810_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24828 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24828 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24828 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_24828_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24828_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24845 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24845 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24845 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_24845_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24845_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24856 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24856 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24856 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_24856_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24856_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24871 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24871 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_24871 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_24871_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_24871_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2600 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2600 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2600 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_2600_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2600_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2604 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2604 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2604 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_2604_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2604_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2606 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2606 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2606 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_2606_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2606_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2609 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2609 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2609 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_2609_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2609_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2612 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2612 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2612 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_2612_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2612_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2615 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2615 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2615 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_2615_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2615_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2618 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2618 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2618 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_2618_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2618_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2619 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2619 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2619 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_2619_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2619_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2620 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2620 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2620 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_2620_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2620_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2964 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2964 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_2964 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_2964_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_2964_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3079 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3079 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3079 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_3079_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3079_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3118 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3118 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3118 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_3118_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3118_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3256 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3256 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3256 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_3256_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3256_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_32769 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_32769 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_32769 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_32769_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_32769_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3350 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3350 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3350 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_3350_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3350_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3381 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3381 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3381 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_3381_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3381_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3394 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3394 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3394 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_3394_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3394_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3429 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3429 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3429 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_3429_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3429_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3456 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3456 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3456 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_3456_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3456_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3466 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3466 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3466 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_3466_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3466_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3592 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3592 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3592 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_3592_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3592_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3596 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3596 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3596 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_3596_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3596_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3600 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3600 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_3600 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_3600_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_3600_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_40961 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_40961 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_40961 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_40961_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_40961_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_57361 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_57361 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_57361 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_57361_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_57361_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_6000 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_6000 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_6000 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_6000_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_6000_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_6100 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_6100 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_6100 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_6100_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_6100_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_6106 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_6106 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_6106 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_6106_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_6106_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_6243 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_6243 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_6243 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_6243_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_6243_index | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_826 | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_826 | chunk_seq | integer | YES |  |  |
| pg_toast | pg_toast_826 | chunk_data | bytea | YES |  |  |
| pg_toast | pg_toast_826_index | chunk_id | oid | YES |  |  |
| pg_toast | pg_toast_826_index | chunk_seq | integer | YES |  |  |
| public | budgets | id | integer | NO | nextval('budgets_id_seq'::regclass) | ✅ |
| public | budgets | farm_id | integer | NO |  |  |
| public | budgets | year | integer | NO |  |  |
| public | budgets | category | character varying(64) | YES |  |  |
| public | budgets | amount | numeric | NO |  |  |
| public | budgets | notes | text | YES |  |  |
| public | budgets | created_at | timestamp without time zone | NO | now() |  |
| public | budgets | updated_at | timestamp without time zone | NO | now() |  |
| public | budgets_id_seq | last_value | bigint | NO |  |  |
| public | budgets_id_seq | log_cnt | bigint | NO |  |  |
| public | budgets_id_seq | is_called | boolean | NO |  |  |
| public | budgets_pkey | id | integer | YES |  |  |
| public | buyers | id | integer | NO | nextval('buyers_id_seq'::regclass) | ✅ |
| public | buyers | name | character varying(255) | NO |  |  |
| public | buyers | contact | character varying(255) | YES |  |  |
| public | buyers | created_at | timestamp without time zone | NO | now() |  |
| public | buyers_id_seq | last_value | bigint | NO |  |  |
| public | buyers_id_seq | log_cnt | bigint | NO |  |  |
| public | buyers_id_seq | is_called | boolean | NO |  |  |
| public | buyers_pkey | id | integer | YES |  |  |
| public | expenses | id | integer | NO | nextval('expenses_id_seq'::regclass) | ✅ |
| public | expenses | farm_id | integer | NO |  |  |
| public | expenses | date | timestamp without time zone | NO | now() |  |
| public | expenses | category | character varying(64) | NO |  |  |
| public | expenses | amount | numeric | NO |  |  |
| public | expenses | description | text | YES |  |  |
| public | expenses | recorded_by | integer | YES |  |  |
| public | expenses | notes | text | YES |  |  |
| public | expenses | status | expense_status | YES | 'Pending'::expense_status |  |
| public | expenses | payment_method | expense_payment_method | YES |  |  |
| public | expenses_id_seq | last_value | bigint | NO |  |  |
| public | expenses_id_seq | log_cnt | bigint | NO |  |  |
| public | expenses_id_seq | is_called | boolean | NO |  |  |
| public | expenses_pkey | id | integer | YES |  |  |
| public | farm_inspections | id | integer | NO | nextval('farm_inspections_id_seq'::regclass) | ✅ |
| public | farm_inspections | farm_id | integer | NO |  |  |
| public | farm_inspections | inspection_date | timestamp without time zone | NO | now() |  |
| public | farm_inspections | inspector | integer | NO |  |  |
| public | farm_inspections | score | integer | YES |  |  |
| public | farm_inspections | notes | text | YES |  |  |
| public | farm_inspections | created_at | timestamp without time zone | NO | now() |  |
| public | farm_inspections | updated_at | timestamp without time zone | NO | now() |  |
| public | farm_inspections | metrics | jsonb | NO | '{}'::jsonb |  |
| public | farm_inspections_id_seq | last_value | bigint | NO |  |  |
| public | farm_inspections_id_seq | log_cnt | bigint | NO |  |  |
| public | farm_inspections_id_seq | is_called | boolean | NO |  |  |
| public | farm_inspections_pkey | id | integer | YES |  |  |
| public | farms | id | integer | NO | nextval('farms_id_seq'::regclass) | ✅ |
| public | farms | name | character varying(255) | NO |  |  |
| public | farms | location | character varying(255) | YES |  |  |
| public | farms | region_code | character varying(16) | YES |  |  |
| public | farms | size | numeric | YES |  |  |
| public | farms | health_score | integer | YES | 0 |  |
| public | farms | health_status | health_status | YES | 'AVERAGE'::health_status |  |
| public | farms | is_active | boolean | YES | true |  |
| public | farms | creator_id | integer | YES |  |  |
| public | farms | created_at | timestamp without time zone | NO | now() |  |
| public | farms | updated_at | timestamp without time zone | NO | now() |  |
| public | farms | group_code | character varying(8) | YES |  |  |
| public | farms_id_seq | last_value | bigint | NO |  |  |
| public | farms_id_seq | log_cnt | bigint | NO |  |  |
| public | farms_id_seq | is_called | boolean | NO |  |  |
| public | farms_pkey | id | integer | YES |  |  |
| public | growth_records | id | integer | NO | nextval('growth_records_id_seq'::regclass) | ✅ |
| public | growth_records | farm_id | integer | NO |  |  |
| public | growth_records | plot_id | integer | YES |  |  |
| public | growth_records | record_date | timestamp without time zone | NO | now() |  |
| public | growth_records | stage | character varying(32) | YES |  |  |
| public | growth_records | notes | text | YES |  |  |
| public | growth_records | metrics | jsonb | YES |  |  |
| public | growth_records | creator_id | integer | YES |  |  |
| public | growth_records | created_at | timestamp without time zone | NO | now() |  |
| public | growth_records | updated_at | timestamp without time zone | NO | now() |  |
| public | growth_records | row_number | integer | YES |  |  |
| public | growth_records | hole_number | integer | YES |  |  |
| public | growth_records | is_main_plant | boolean | YES | true |  |
| public | growth_records | parent_plant_id | integer | YES |  |  |
| public | growth_records_id_seq | last_value | bigint | NO |  |  |
| public | growth_records_id_seq | log_cnt | bigint | NO |  |  |
| public | growth_records_id_seq | is_called | boolean | NO |  |  |
| public | growth_records_pkey | id | integer | YES |  |  |
| public | harvest_records | id | integer | NO | nextval('harvest_records_id_seq'::regclass) | ✅ |
| public | harvest_records | farm_id | integer | NO |  |  |
| public | harvest_records | harvest_date | timestamp without time zone | NO | now() |  |
| public | harvest_records | quantity | integer | YES |  |  |
| public | harvest_records | weight | numeric | YES |  |  |
| public | harvest_records | quality | character varying(32) | YES | 'AVERAGE'::character varying |  |
| public | harvest_records | notes | text | YES |  |  |
| public | harvest_records | created_at | timestamp without time zone | NO | now() |  |
| public | harvest_records | updated_at | timestamp without time zone | NO | now() |  |
| public | harvest_records | user_id | integer | YES |  |  |
| public | harvest_records | harvest_team | json | YES |  |  |
| public | harvest_records | plot_id | integer | YES |  |  |
| public | harvest_records_id_seq | last_value | bigint | NO |  |  |
| public | harvest_records_id_seq | log_cnt | bigint | NO |  |  |
| public | harvest_records_id_seq | is_called | boolean | NO |  |  |
| public | harvest_records_pkey | id | integer | YES |  |  |
| public | inspection_metrics | id | integer | NO | nextval('inspection_metrics_id_seq'::regclass) | ✅ |
| public | inspection_metrics | metric_name | character varying(64) | YES |  |  |
| public | inspection_metrics | score | integer | YES |  |  |
| public | inspection_metrics | max_score | integer | YES |  |  |
| public | inspection_metrics | notes | text | YES |  |  |
| public | inspection_metrics_id_seq | last_value | bigint | NO |  |  |
| public | inspection_metrics_id_seq | log_cnt | bigint | NO |  |  |
| public | inspection_metrics_id_seq | is_called | boolean | NO |  |  |
| public | inspection_metrics_pkey | id | integer | YES |  |  |
| public | knowledge_articles | id | integer | NO | nextval('knowledge_articles_id_seq'::regclass) | ✅ |
| public | knowledge_articles | title | character varying(255) | YES |  |  |
| public | knowledge_articles | content | text | YES |  |  |
| public | knowledge_articles | category | character varying(64) | YES |  |  |
| public | knowledge_articles | tags | text | YES |  |  |
| public | knowledge_articles | published | boolean | YES | false |  |
| public | knowledge_articles | author_id | integer | YES |  |  |
| public | knowledge_articles | created_at | timestamp without time zone | NO | now() |  |
| public | knowledge_articles | updated_at | timestamp without time zone | NO | now() |  |
| public | knowledge_articles_id_seq | last_value | bigint | NO |  |  |
| public | knowledge_articles_id_seq | log_cnt | bigint | NO |  |  |
| public | knowledge_articles_id_seq | is_called | boolean | NO |  |  |
| public | knowledge_articles_pkey | id | integer | YES |  |  |
| public | plots | id | integer | NO | nextval('plots_id_seq'::regclass) | ✅ |
| public | plots | name | character varying(255) | NO |  |  |
| public | plots | farm_id | integer | NO |  |  |
| public | plots | area | numeric | YES |  |  |
| public | plots | planted_date | timestamp without time zone | YES |  |  |
| public | plots | crop_type | character varying(64) | YES | 'BANANA'::character varying |  |
| public | plots | status | character varying(32) | YES | 'ACTIVE'::character varying |  |
| public | plots | holes | integer | YES | 0 |  |
| public | plots | created_at | timestamp without time zone | NO | now() |  |
| public | plots | updated_at | timestamp without time zone | NO | now() |  |
| public | plots | row_count | integer | YES | 0 |  |
| public | plots | plant_count | integer | YES | 0 |  |
| public | plots | layout_structure | jsonb | YES |  |  |
| public | plots | soil_type | character varying(64) | YES |  |  |
| public | plots_id_seq | last_value | bigint | NO |  |  |
| public | plots_id_seq | log_cnt | bigint | NO |  |  |
| public | plots_id_seq | is_called | boolean | NO |  |  |
| public | plots_pkey | id | integer | YES |  |  |
| public | sales | id | integer | NO | nextval('sales_id_seq'::regclass) | ✅ |
| public | sales | farm_id | integer | NO |  |  |
| public | sales | date | timestamp without time zone | NO | now() |  |
| public | sales | product | character varying(128) | NO |  |  |
| public | sales | quantity | integer | NO |  |  |
| public | sales | unit_price | numeric | NO |  |  |
| public | sales | total_amount | numeric | NO |  |  |
| public | sales | buyer_id | character varying(64) | NO |  |  |
| public | sales | buyer_name | character varying(255) | YES |  |  |
| public | sales | payment_status | payment_status | NO |  |  |
| public | sales | payment_method | payment_method | YES |  |  |
| public | sales | notes | text | YES |  |  |
| public | sales_id_seq | last_value | bigint | NO |  |  |
| public | sales_id_seq | log_cnt | bigint | NO |  |  |
| public | sales_id_seq | is_called | boolean | NO |  |  |
| public | sales_pkey | id | integer | YES |  |  |
| public | task_comments | id | integer | NO | nextval('task_comments_id_seq'::regclass) | ✅ |
| public | task_comments | task_id | integer | NO |  |  |
| public | task_comments | content | text | YES |  |  |
| public | task_comments | user_id | integer | NO |  |  |
| public | task_comments | created_at | timestamp without time zone | NO | now() |  |
| public | task_comments | updated_at | timestamp without time zone | NO | now() |  |
| public | task_comments_id_seq | last_value | bigint | NO |  |  |
| public | task_comments_id_seq | log_cnt | bigint | NO |  |  |
| public | task_comments_id_seq | is_called | boolean | NO |  |  |
| public | task_comments_pkey | id | integer | YES |  |  |
| public | tasks | id | integer | NO | nextval('tasks_id_seq'::regclass) | ✅ |
| public | tasks | title | character varying(255) | NO |  |  |
| public | tasks | description | text | YES |  |  |
| public | tasks | farm_id | integer | YES |  |  |
| public | tasks | status | task_status | YES | 'PENDING'::task_status |  |
| public | tasks | priority | task_priority | YES | 'MEDIUM'::task_priority |  |
| public | tasks | due_date | timestamp without time zone | YES |  |  |
| public | tasks | completed_date | timestamp without time zone | YES |  |  |
| public | tasks | assignee_id | integer | YES |  |  |
| public | tasks | creator_id | integer | YES |  |  |
| public | tasks | created_at | timestamp without time zone | NO | now() |  |
| public | tasks | updated_at | timestamp without time zone | NO | now() |  |
| public | tasks | plot_id | integer | YES |  |  |
| public | tasks_id_seq | last_value | bigint | NO |  |  |
| public | tasks_id_seq | log_cnt | bigint | NO |  |  |
| public | tasks_id_seq | is_called | boolean | NO |  |  |
| public | tasks_pkey | id | integer | YES |  |  |
| public | users | id | integer | NO | nextval('users_id_seq'::regclass) | ✅ |
| public | users | name | character varying(255) | NO |  |  |
| public | users | email | character varying(255) | NO |  |  |
| public | users | email_verified | timestamp without time zone | YES |  |  |
| public | users | password | character varying(255) | YES |  |  |
| public | users | image | text | YES |  |  |
| public | users | role | user_role | NO | 'MANAGER'::user_role |  |
| public | users | phone | character varying(50) | YES |  |  |
| public | users | created_at | timestamp without time zone | NO | now() |  |
| public | users | updated_at | timestamp without time zone | NO | now() |  |
| public | users | active | boolean | NO | true |  |
| public | users | avatar | character varying(255) | YES |  |  |
| public | users | status | character varying(32) | YES |  |  |
| public | users | salary | integer | YES |  |  |
| public | users | start_date | date | YES |  |  |
| public | users | location | character varying(128) | YES |  |  |
| public | users | responsibilities | jsonb | YES |  |  |
| public | users | skills | jsonb | YES |  |  |
| public | users | stack_auth_id | character varying(64) | YES |  |  |
| public | users_email_key | email | character varying(255) | YES |  |  |
| public | users_id_seq | last_value | bigint | NO |  |  |
| public | users_id_seq | log_cnt | bigint | NO |  |  |
| public | users_id_seq | is_called | boolean | NO |  |  |
| public | users_pkey | id | integer | YES |  |  |
| public | users_stack_auth_id_key | stack_auth_id | character varying(64) | YES |  |  |
| public | weather_records | id | integer | NO | nextval('weather_records_id_seq'::regclass) | ✅ |
| public | weather_records | location | character varying(255) | YES |  |  |
| public | weather_records | record_date | timestamp without time zone | NO | now() |  |
| public | weather_records | temperature | numeric | YES |  |  |
| public | weather_records | humidity | numeric | YES |  |  |
| public | weather_records | wind_speed | numeric | YES |  |  |
| public | weather_records | rainfall | numeric | YES |  |  |
| public | weather_records | conditions | character varying(64) | YES |  |  |
| public | weather_records | created_at | timestamp without time zone | NO | now() |  |
| public | weather_records_id_seq | last_value | bigint | NO |  |  |
| public | weather_records_id_seq | log_cnt | bigint | NO |  |  |
| public | weather_records_id_seq | is_called | boolean | NO |  |  |
| public | weather_records_pkey | id | integer | YES |  |  |