# Database Relationships (Foreign Keys)
| Constraint | Source Schema | Source Table | Source Column | Target Schema | Target Table | Target Column |
|------------|---------------|-------------|--------------|---------------|-------------|--------------|
| farms_creator_id_fkey | public | farms | creator_id | public | users | id |
| plots_farm_id_fkey | public | plots | farm_id | public | farms | id |
| tasks_farm_id_fkey | public | tasks | farm_id | public | farms | id |
| tasks_assignee_id_fkey | public | tasks | assignee_id | public | users | id |
| tasks_creator_id_fkey | public | tasks | creator_id | public | users | id |
| task_comments_task_id_fkey | public | task_comments | task_id | public | tasks | id |
| task_comments_user_id_fkey | public | task_comments | user_id | public | users | id |
| growth_records_farm_id_fkey | public | growth_records | farm_id | public | farms | id |
| growth_records_plot_id_fkey | public | growth_records | plot_id | public | plots | id |
| growth_records_creator_id_fkey | public | growth_records | creator_id | public | users | id |
| farm_inspections_farm_id_fkey | public | farm_inspections | farm_id | public | farms | id |
| harvest_records_farm_id_fkey | public | harvest_records | farm_id | public | farms | id |
| knowledge_articles_author_id_fkey | public | knowledge_articles | author_id | public | users | id |
| sales_farm_id_fkey | public | sales | farm_id | public | farms | id |
| expenses_farm_id_fkey | public | expenses | farm_id | public | farms | id |
| expenses_recorded_by_fkey | public | expenses | recorded_by | public | users | id |
| budgets_farm_id_fkey | public | budgets | farm_id | public | farms | id |
| fk_inspector | public | farm_inspections | inspector | public | users | id |
| growth_records_parent_plant_id_fkey | public | growth_records | parent_plant_id | public | growth_records | id |
| harvest_records_user_id_fkey | public | harvest_records | user_id | public | users | id |
| harvest_records_plot_id_fkey | public | harvest_records | plot_id | public | plots | id |
| fk_tasks_plot | public | tasks | plot_id | public | plots | id |