# TODO

## P0

- [ ] Починить локальный sync для `repo.path`
  Сейчас демо-конфиг в `VibeManager-app/repositories.json` указывает `./dummy-project-1`, но `VibeManager-app/src/sync.js` интерпретирует путь относительно `process.cwd()` (`VibeManager-app`), поэтому `npm run sync` не находит тестовый проект. Нужно либо нормализовать `repo.path` относительно файла конфигурации/корня репозитория, либо поправить пример конфигурации и README так, чтобы onboarding работал из коробки.

- [ ] Сделать frontend lint независимым от `dist`
  После `npm run build` команда `npm run lint` в `VibeManager-app/frontend` валится на сгенерированном bundle, потому что `eslint .` цепляет `dist`. Нужно жёстко исключить build-артефакты из линта или сузить область линтинга до исходников.

- [ ] Убрать побочные эффекты из `aggregate` test
  `VibeManager-app/test/aggregate.test.js` запускает реальный `src/aggregate.js`, который переписывает tracked fixture-файлы новым `lastUpdated`. В результате простой `npm test` пачкает рабочее дерево. Нужен детерминированный тест: фиксированное время, временная копия fixture или сравнение без записи в tracked-файлы.

## Active Work: VibeAgent-skill

### Findings

- `VibeAgent-skill` обещает более строгий session protocol, чем реально enforce'ят `validate.js` и `close-session.js`.
- Session protocol продублирован между `SKILL.md`, `agents-md-template.md` и `bootstrap-templates.md`, из-за чего высок риск drift.
- Идеи из внешней инструкции про `tasks/todo.md` и `tasks/lessons.md` нельзя копировать буквально: текущий validator считает каждый `tasks/*.md` task-файлом с YAML frontmatter.
- В skill не хватает жёсткого правила про planning для non-trivial work и proof-of-verification перед переводом задачи в `done`.
- `STREAMS.md` пока почти декоративный; его можно сделать execution/orchestration слоем для parallel work и subagents-capable агентов.

### Plan

- [x] Упростить и уточнить `VibeAgent-skill/SKILL.md` как router + orchestration policy.
- [x] Обновить `agents-md-template.md` и `bootstrap-templates.md` под planning, verification, lessons и bugfix flow.
- [x] Ужесточить `validate.js` и `close-session.js`, чтобы protocol был ближе к декларируемому.
- [x] Прогнать консистентность изменений и записать дополнительные идеи/остаточные риски.

### Idea Log

- Рассмотреть `VibeAgent/LESSONS.md` вместо `tasks/lessons.md`.
- Добавить в task template секции `Plan`, `Verification`, `Review`.
- Сделать правило: `done`-task без `Verification` невалиден.
- Если agent поддерживает subagents, связать их с `STREAMS.md`; если нет, использовать ту же структуру как manual decomposition.
- Синхронизировать декларируемую структуру skill и `requiredFiles` validator'а, иначе governance снова разъедется.
- Не копировать буквально external `tasks/todo.md`: в текущем каноне план должен жить в task-файле или spec, а не отдельным markdown под `tasks/`.
- Следующий шаг после этого diff: продумать migration story для уже существующих VibeAgent-репозиториев без `LESSONS.md`, `## Plan` и `## Verification`.

### Review

- `SKILL.md` переведён в более явный orchestration/router режим: plan-first, re-plan, verification-before-done, lessons loop, capability-based parallelism.
- `AGENTS.md` и bootstrap templates синхронизированы с новым protocol.
- `validate.js` и `close-session.js` теперь ближе к реальному enforcement, а не только к advisory-подсказкам.

## Active Work: Migration Story

### Findings

- Текущий skill описывает quarantine-first onboarding, но не даёт полноценного migration workflow для произвольного существующего harness/canon.
- Нужен user-visible questionnaire до миграции, иначе даже безопасная миграция выглядит как внезапная замена правил.
- Полезные находки старого harness не должны просто архивироваться: их нужно маршрутизировать в `LESSONS.md`, `COMMANDS.yaml`, `userprompts/`, `research/`, `AGENTS.md` или другие канонические места как extras.

### Plan

- [x] Добавить migration intake и questionnaire в `VibeAgent-skill/SKILL.md`.
- [x] Добавить reference-playbook с mapping legacy artifacts -> VibeAgent destinations.
- [x] Добавить скриптовую опору для audit существующего harness/canon перед миграцией.
- [x] Подсветить migration-aware behavior в bootstrap tooling и зафиксировать новые идеи/риски.

### Idea Log

- Для migration лучше не invent'ить отдельный `MIGRATION.md` в проекте по умолчанию, а переиспользовать `quarantine/REGISTRY.md` и канонические destination-файлы.
- Хорошие legacy-находки удобно делить на: rules, prompts, commands, research, session history, architecture facts, open tasks.
- Questionnaire должен покрывать режим миграции: replace, shadow, phased.
- Безопасный default для неответившего пользователя: `shadow` + quarantine-first + no deletion.
- `auto-bootstrap.js` пока только печатает migration-aware questionnaire и сохраняет старый `AGENTS.md`; полноценный interactive intake можно сделать отдельным этапом.

### Review

- Skill теперь умеет различать greenfield bootstrap и migration onboarding.
- Появился отдельный playbook для migration questionnaire, legacy mapping и import-as-extras логики.
- Добавлен `audit-harness.js` для классификации существующего governance surface перед миграцией.

## Active Work: Harness Engineering Alignment

### Findings

- Исходная идея репозитория остаётся узкой: `VibeAgent-skill` должен усиливать governance/execution через существующий canon, а `VibeManager-app` должен оставаться тонким portfolio observer.
- Прошлая версия плана была слишком широкой для этого shape: новые обязательные canon-файлы и synthetic readiness score добавили бы лишнюю поверхность без прямой operational отдачи.
- Самая полезная часть harness-engineering для этого проекта лежит не в новых docs, а в safer migration gate, command-backed verification и минимальном сигнале о качестве harness на уровне aggregate.

### Plan

- [ ] Сделать migration bootstrap safe-by-default: legacy harness -> preflight without writes unless explicit migration flags are provided.
- [ ] Добавить минимальные schema/tooling расширения: `project.migration_mode` в metadata и `required_for_done` в command entries.
- [ ] Научить `close-session.js` запускать required verification commands после structural validation.
- [ ] Протащить минимальный harness signal в aggregate/UI без readiness score и без новых обязательных canonical docs.
- [ ] Прогнать targeted tests и зафиксировать остаточные риски.

### Idea Log

- Не добавлять обязательные `RUNBOOK.md`, `REFERENCE_EXAMPLES.md`, `LOCAL_CONTEXT.md` и отдельный `MIGRATION.md`: нужный signal уже укладывается в текущий canon.
- Если bootstrap не может уверенно определить verification commands, лучше записать их как reference entries без `required_for_done`, чем гадать.
- Для migration UX безопаснее explicit rerun с flags, чем интерактивный wizard внутри `curl | bash`.
