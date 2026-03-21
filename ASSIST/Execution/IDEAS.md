# Planning

## Purpose

This file share my ideas before implementation expands.

Read ASSIST/AI_RULES.md
Read this file full and
Update PLANNING , TASK and WALKTHROUGH before start

add is_active created_at updated_at to all table

create master modules
1. media_files
   id UUID PRIMARY KEY
   file_name VARCHAR(255)
   original_name VARCHAR(255)
   file_url VARCHAR(500)
   thumbnail_url VARCHAR(500)
   file_type VARCHAR(50) -- image, video, document
   mime_type VARCHAR(100)
   file_size INT
   width INT
   height INT
   alt_text VARCHAR(255)
   title VARCHAR(255)
   folder_id UUID
   is_optimized BOOLEAN DEFAULT FALSE
   created_at TIMESTAMP
   updated_at TIMESTAMP
2. media_folders
   id UUID PRIMARY KEY
   name VARCHAR(200)
   parent_id UUID
3. media_tags
   id UUID
   name VARCHAR(100)
4. media_tag_map
   id UUID
   media_id UUID
   tag_id UUID
5. media_usage
   id UUID
   media_id UUID
   entity_type VARCHAR(100) -- product, category, banner
   entity_id UUID
   usage_type VARCHAR(50) -- thumbnail, gallery, featured
6. media_versions
   id UUID
   media_id UUID
   version_type VARCHAR(50) -- thumbnail, small, medium, large
   file_url VARCHAR(500)
   width INT
   height INT

create storage folder and create symlink to this in public and make private and public folder inside storage and ask option for save in
when save return to list


