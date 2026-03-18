-- DevTools Directory: initial schema + seed data

create extension if not exists pgcrypto;

create schema if not exists api;

create table if not exists api.devtools (
    id uuid primary key default gen_random_uuid(),
    added_at date not null default current_date,
    name text not null,
    description text not null,
    details text not null,
    category text not null,
    tags text[] not null default '{}'::text[],
    url text not null,
    cover_image text,
    created_at timestamptz not null default now(),
    constraint devtools_category_check
        check (category in ('IA', 'DevTool', 'Docs', 'Library', 'Tool')),
    constraint devtools_url_check
        check (url ~* '^https?://')
);

create index if not exists devtools_category_idx on api.devtools (category);
create index if not exists devtools_tags_gin on api.devtools using gin (tags);
create index if not exists devtools_added_at_idx on api.devtools (added_at desc);

alter table api.devtools enable row level security;

-- Grants (required when using non-public schemas)
grant usage on schema api to anon, authenticated;
grant select on api.devtools to anon, authenticated;
grant all on api.devtools to service_role;

-- RLS policies
drop policy if exists "Public read devtools" on api.devtools;
create policy "Public read devtools"
on api.devtools
for select
to anon, authenticated
using (true);

drop policy if exists "Service role manage devtools" on api.devtools;
create policy "Service role manage devtools"
on api.devtools
for all
to service_role
using (true)
with check (true);

-- Seed data (migrated from static/tools.json)
insert into api.devtools (added_at, name, description, details, category, url, cover_image, tags)
values
    (
        '2026-02-21',
        'All in AI Tools',
        'Plataforma que agrupan diversas herramientas de inteligencia artificial en un solo lugar.',
        'Encuentra las mejores herramientas IA reunidas en una sola página donde puedes buscar las más destacadas, populares o las que te llamen la atención.',
        'IA',
        'https://allinai.tools/tools',
        'https://allinai.tools/sponsored.jpg',
        array['recursos', 'desarrollo', 'productividad']
    ),
    (
        '2026-02-21',
        'Aixploria (Free IAs)',
        'Uno de los mayores directorios de inteligencia artificial (IA) gratuitos del mundo, diseñado para ayudar a descubrir, filtrar y utilizar las mejores herramientas IA disponibles.',
        'Funciona como una plataforma centralizada que recopila, categoriza y reseña miles de aplicaciones de inteligencia artificial. Más específicamente, las herramientas gratuitas o con acceso gratuito inicial.',
        'IA',
        'https://www.aixploria.com/en/free-ai/',
        'https://www.aixploria.com/wp-content/uploads/2025/02/free-ai-apps.webp',
        array['recursos', 'desarrollo', 'productividad']
    ),
    (
        '2026-02-21',
        'FindTube AI',
        'La mejor forma de buscar videos educativos en Youtube con filtros avanzados.',
        'FindTube AI es una plataforma que permite buscar videos educativos en YouTube utilizando inteligencia artificial. Ofrece filtros avanzados y resultados optimizados para que encuentres exactamente lo que buscas.',
        'IA',
        'https://findtube.ai/',
        'https://www.aixploria.com/wp-content/uploads/2026/02/findtube_ai.webp',
        array['recursos', 'youtube', 'productividad']
    ),
    (
        '2026-02-21',
        'El Rincón del dev',
        'Canal de Youtube que recopila distintas herramientas web o IA útiles para el desarrollo de software',
        'Shorts y vídeos donde se presentan herramientas web e IA para desarrolladores. Ideal para descubrir nuevas utilidades de forma rápida y visual.',
        'Tool',
        'https://www.youtube.com/@elrincondeldev/shorts',
        'https://s.yimg.com/ny/api/res/1.2/TBdKVtwq2yFVprZcFnL4jQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTM2MA--/https://media.zenfs.com/en/mashable_articles_863/f4c1890d6f03f76910751244659db4a1',
        array['recursos', 'información', 'desarrollo']
    ),
    (
        '2026-02-21',
        'Skywork AI',
        'Plataforma de agentes de IA que automatiza tareas de productividad y generación de contenido.',
        'Skywork ayuda a crear documentos, presentaciones, hojas de cálculo, podcasts y análisis complejos mediante investigación profunda, automatización, y marketing.',
        'IA',
        'https://skywork.ai/',
        'https://imgv3.fotor.com/images/side/Various-customizable-presentation-templates-on-Fotor-free-AI-presentation-maker.jpg',
        array['recursos', 'productividad', 'automatización']
    ),
    (
        '2026-02-21',
        'Verdent AI',
        'Asistente de codificación con enfoque en contexto de proyecto y refactorizaciones.',
        'Verdent es un copiloto de desarrollo que ofrece sugerencias de código, refactorizaciones y explicaciones basadas en el contexto completo de un proyecto. Excelente para planificar un MVP con código y documentación.',
        'IA',
        'https://www.verdent.ai',
        'https://cdn.sanity.io/images/bqtu9hf1/production/0f1dbc1bfd485e1b9e1565aa44fdc3cedf6fcbc3-756x400.png?w=800',
        array['chatbot', 'desarrollo', 'automatización']
    ),
    (
        '2026-02-21',
        'Claude Code Templates',
        'Configuraciones predefinidas, prompts y herramientas diseñadas para potenciar al máximo Claude Code.',
        'Web de plantillas que transforman a Claude de un chat básico a un agente autónomo especializado, capaz de editar archivos, ejecutar pruebas y configurar proyectos completos, según tus necesidades.',
        'IA',
        'https://www.aitmpl.com/skills',
        'https://media.licdn.com/dms/image/v2/D5622AQELbPMM1YKqSA/feedshare-shrink_800/B56ZfxKDkWHoAo-/0/1752097635745?e=2147483647&v=beta&t=WoUz_0zq926TNPUElHeA6ZgzwC3iM54LV-yqYYG9Zgk',
        array['recursos', 'desarrollo', 'automatización']
    ),
    (
        '2026-02-21',
        'Stitch with Google',
        'Chatbot especializado en la generación de plantillas web con diseño profesional según tus necesidades.',
        'Generar interfaces de usuario (UI) para aplicaciones web y móviles a partir de prompts, imágenes o bocetos. Potenciada por Gemini, permite pasar de una idea a un prototipo funcional rápidamente, facilitando la exportación de los diseños a Figma o la obtención de código HTML/JS.',
        'IA',
        'https://stitch.withgoogle.com/',
        'https://i.ytimg.com/vi/8M7MMu89jrs/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCTl-l11XU9ZCKPVNk08qa9yEm5dw',
        array['chatbot', 'diseño', 'desarrollo']
    )
on conflict do nothing;

