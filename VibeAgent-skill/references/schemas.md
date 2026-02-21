# JSON Schemas for VibeAgent Canon Validation

These schemas are placed in `VibeAgent/_schemas/` during bootstrap. The validator (`_tools/validate.js`)
uses them to validate YAML files and task frontmatter.

---

## metadata.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://vibeagent.local/schemas/metadata.schema.json",
  "title": "VibeAgent - METADATA.yaml",
  "type": "object",
  "required": ["pack_version", "project", "owners", "conventions"],
  "properties": {
    "pack_version": { "type": "integer" },
    "project": {
      "type": "object",
      "required": ["id", "name", "department", "target_quarter", "created_at", "last_updated"],
      "properties": {
        "id": { "type": "string", "minLength": 1 },
        "name": { "type": "string", "minLength": 1 },
        "department": { "type": "string", "minLength": 1 },
        "target_quarter": { "type": "string" },
        "created_at": { "type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" },
        "last_updated": { "type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" }
      },
      "additionalProperties": true
    },
    "owners": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["name", "role", "contact"],
        "properties": {
          "name": { "type": "string" },
          "role": { "type": "string" },
          "contact": { "type": "string" }
        },
        "additionalProperties": true
      }
    },
    "conventions": {
      "type": "object",
      "required": ["timezone", "id_prefixes"],
      "properties": {
        "timezone": { "type": "string" },
        "freshness_sla_days": { "type": "integer", "minimum": 1 },
        "id_prefixes": { "type": "object", "additionalProperties": { "type": "string" } }
      },
      "additionalProperties": true
    }
  },
  "additionalProperties": true
}
```

---

## map.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://vibeagent.local/schemas/map.schema.json",
  "title": "VibeAgent - MAP.yaml",
  "type": "object",
  "required": ["map_version", "subsystems", "components", "flows", "flow_steps"],
  "properties": {
    "map_version": { "type": "integer" },
    "subsystems": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "summary", "owner"],
        "properties": {
          "id": { "type": "string", "pattern": "^SUBSYS_" },
          "name": { "type": "string" },
          "summary": { "type": "string" },
          "owner": { "type": "string" },
          "component_ids": { "type": "array", "items": { "type": "string" } },
          "flow_ids": { "type": "array", "items": { "type": "string" } }
        },
        "additionalProperties": true
      }
    },
    "components": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "subsystem_id", "summary", "owner", "paths"],
        "properties": {
          "id": { "type": "string", "pattern": "^COMP_" },
          "name": { "type": "string" },
          "subsystem_id": { "type": "string" },
          "summary": { "type": "string" },
          "owner": { "type": "string" },
          "paths": { "type": "array", "items": { "type": "string" } },
          "depends_on_components": { "type": "array", "items": { "type": "string" } }
        },
        "additionalProperties": true
      }
    },
    "flows": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "summary", "owner", "step_ids"],
        "properties": {
          "id": { "type": "string", "pattern": "^FLOW_" },
          "name": { "type": "string" },
          "summary": { "type": "string" },
          "owner": { "type": "string" },
          "step_ids": { "type": "array", "items": { "type": "string" } }
        },
        "additionalProperties": true
      }
    },
    "flow_steps": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "flow_id", "name", "from_ref", "to_ref", "kind"],
        "properties": {
          "id": { "type": "string", "pattern": "^STEP_" },
          "flow_id": { "type": "string" },
          "name": { "type": "string" },
          "from_ref": {
            "type": "object",
            "required": ["type", "id"],
            "properties": { "type": { "type": "string" }, "id": { "type": "string" } },
            "additionalProperties": false
          },
          "to_ref": {
            "type": "object",
            "required": ["type", "id"],
            "properties": { "type": { "type": "string" }, "id": { "type": "string" } },
            "additionalProperties": false
          },
          "kind": { "type": "string" },
          "notes": { "type": "string" }
        },
        "additionalProperties": true
      }
    }
  },
  "additionalProperties": true
}
```

---

## commands.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://vibeagent.local/schemas/commands.schema.json",
  "title": "VibeAgent - COMMANDS.yaml",
  "type": "object",
  "required": ["commands_version", "command_groups"],
  "properties": {
    "commands_version": { "type": "integer" },
    "command_groups": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id", "title", "commands"],
        "properties": {
          "id": { "type": "string", "pattern": "^CMD_GROUP_" },
          "title": { "type": "string" },
          "commands": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["id", "title", "copy_text"],
              "properties": {
                "id": { "type": "string", "pattern": "^CMD_" },
                "title": { "type": "string" },
                "description": { "type": "string" },
                "copy_text": { "type": "string" },
                "links_to": { "type": "array", "items": { "type": "string" } }
              },
              "additionalProperties": true
            }
          }
        },
        "additionalProperties": true
      }
    }
  },
  "additionalProperties": true
}
```

---

## prompts.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://vibeagent.local/schemas/prompts.schema.json",
  "title": "VibeAgent - userprompts/INDEX.yaml",
  "type": "object",
  "required": ["prompts_version", "prompts"],
  "properties": {
    "prompts_version": { "type": "integer" },
    "prompts": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "file", "title", "word_count", "latest_revision", "used_in_tasks", "created_at", "updated_at"],
        "properties": {
          "id": { "type": "string", "pattern": "^PROMPT_" },
          "file": { "type": "string" },
          "title": { "type": "string" },
          "word_count": { "type": "integer", "minimum": 0 },
          "tags": { "type": "array", "items": { "type": "string" } },
          "latest_revision": { "type": "string" },
          "used_in_tasks": { "type": "array", "items": { "type": "string" } },
          "created_at": { "type": "string" },
          "updated_at": { "type": "string" }
        },
        "additionalProperties": true
      }
    }
  },
  "additionalProperties": true
}
```

---

## research.schema.json

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://vibeagent.local/schemas/research.schema.json",
  "title": "VibeAgent - research/INDEX.yaml",
  "type": "object",
  "required": ["research_version", "items"],
  "properties": {
    "research_version": { "type": "integer" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title", "folder", "target_feature", "why_relevant", "artifacts", "linked_tasks", "created_at", "updated_at"],
        "properties": {
          "id": { "type": "string", "pattern": "^RES_" },
          "title": { "type": "string" },
          "folder": { "type": "string" },
          "target_feature": { "type": "string" },
          "why_relevant": { "type": "string" },
          "artifacts": {
            "type": "object",
            "required": ["screenshots", "scripts", "snippets", "trace"],
            "properties": {
              "screenshots": { "type": "array", "items": { "type": "string" } },
              "scripts": { "type": "array", "items": { "type": "string" } },
              "snippets": { "type": "array", "items": { "type": "string" } },
              "trace": { "type": "array", "items": { "type": "string" } }
            },
            "additionalProperties": true
          },
          "linked_tasks": { "type": "array", "items": { "type": "string" } },
          "tags": { "type": "array", "items": { "type": "string" } },
          "created_at": { "type": "string" },
          "updated_at": { "type": "string" }
        },
        "additionalProperties": true
      }
    }
  },
  "additionalProperties": true
}
```
