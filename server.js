import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const app = express();

const PORT =
  process.env.PORT || 3000;

const PUBLIC_URL = (
  process.env.PUBLIC_URL ||
  `http://localhost:${PORT}`
).replace(/\/$/, '');

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'cambiar-secreto';

const SUPABASE_URL = (
  process.env.SUPABASE_URL || ''
).replace(/\/$/, '');

const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || '';

const MP_ACCESS_TOKEN =
  process.env.MP_ACCESS_TOKEN || '';

const BUSINESS_WHATSAPP =
  process.env.BUSINESS_WHATSAPP ||
  '5491123456789';

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || '';

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || '';

const FACEBOOK_URL =
  'https://www.facebook.com/profile.php?id=61578004386934';

const INSTAGRAM_URL =
  'https://www.instagram.com/cursosconstitucion/';

const TIKTOK_URL =
  'https://www.tiktok.com/@centroconstitucion';

const GOOGLE_URL =
  'https://share.google/PQctCPxZN564FGlPw';

const ADDRESS =
  'Av. Brasil 1223, Constitución, CABA';

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(cookieParser());

const defaultCourses = [
  {
    id: 'barberia',
    icon: '💈',
    image: '',
    name: 'Barbería',
    description:
      'Curso de corte masculino desde nivel inicial con prácticas presenciales.',
    schedules: [
      'Martes de 16:00 a 18:00',
      'Sábados de 09:00 a 11:00',
      'Sábados de 11:00 a 13:00'
    ],
    registration: 20000,
    monthlyFee: 80000
  },

  {
    id: 'peluqueria',
    icon: '✂️',
    image: '',
    name: 'Peluquería',
    description:
      'Curso de peluquería nivel inicial con prácticas presenciales.',
    schedules: [
      'Miércoles de 15:00 a 18:00',
      'Sábados de 09:00 a 12:00'
    ],
    registration: 20000,
    monthlyFee: 80000
  },

  {
    id: 'colorimetria',
    icon: '🎨',
    image: '',
    name: 'Colorimetría',
    description:
      'Aprendé teoría del color, diagnóstico y técnicas profesionales.',
    schedules: [
      'Horario próximamente'
    ],
    registration: 20000,
    monthlyFee: 80000
  },

  {
    id: 'manicuria-pedicuria',
    icon: '💅',
    image: '',
    name: 'Manicuría y Pedicuría',
    description:
      'Curso presencial de técnicas de manicuría y pedicuría.',
    schedules: [
      'Horario próximamente'
    ],
    registration: 20000,
    monthlyFee: 80000
  }
];

const defaultProducts = [
  {
    id: 'tijera-profesional',
    icon: '✂️',
    image: '',
    name: 'Tijera profesional',
    price: 45000,
    stock: 10
  },

  {
    id: 'maquina-corte',
    icon: '🪒',
    image: '',
    name: 'Máquina de corte',
    price: 90000,
    stock: 8
  },

  {
    id: 'secador-profesional',
    icon: '💨',
    image: '',
    name: 'Secador profesional',
    price: 70000,
    stock: 6
  }
];

let memoryCourses =
  [...defaultCourses];

let memoryProducts =
  [...defaultProducts];

let siteSettings = {
  backgroundImage:
    process.env.BACKGROUND_IMAGE || ''
};

function money(value) {
  return new Intl.NumberFormat(
    'es-AR',
    {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }
  ).format(
    Number(value || 0)
  );
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /[^a-z0-9]+/g,
      '-'
    )
    .replace(
      /^-+|-+$/g,
      ''
    );
}

function normalizeSchedules(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  return String(value)
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);
}

async function supabaseRequest(
  path,
  options = {}
) {
  if (
    !SUPABASE_URL ||
    !SUPABASE_SECRET_KEY
  ) {
    return null;
  }

  try {
    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/${path}`,
        {
          ...options,

          headers: {
            apikey:
              SUPABASE_SECRET_KEY,

            Authorization:
              `Bearer ${SUPABASE_SECRET_KEY}`,

            'Content-Type':
              'application/json',

            ...(options.headers || {})
          }
        }
      );

    if (!response.ok) {
      console.error(
        'Supabase:',
        response.status,
        await response.text()
      );

      return null;
    }

    const text =
      await response.text();

    if (!text) {
      return true;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (error) {
    console.error(
      'Supabase error:',
      error
    );

    return null;
  }
}

async function getCourses() {
  const data =
    await supabaseRequest(
      'courses?select=*&order=name.asc'
    );

  if (
    Array.isArray(data) &&
    data.length
  ) {
    memoryCourses =
      data.map(course => ({
        id: String(course.id),
        icon:
          course.icon || '🎓',
        image:
          course.image || '',
        name:
          course.name || 'Curso',
        description:
          course.description || '',
        schedules:
          normalizeSchedules(
            course.schedules
          ),
        registration:
          Number(
            course.registration || 0
          ),
        monthlyFee:
          Number(
            course.monthly_fee ??
            course.monthlyFee ??
            0
          )
      }));
  }

  return memoryCourses;
}

async function getProducts() {
  const data =
    await supabaseRequest(
      'products?select=*&order=name.asc'
    );

  if (
    Array.isArray(data) &&
    data.length
  ) {
    memoryProducts =
      data.map(product => ({
        id: String(product.id),
        icon:
          product.icon || '🛍️',
        image:
          product.image || '',
        name:
          product.name || 'Artículo',
        price:
          Number(
            product.price || 0
          ),
        stock:
          Number(
            product.stock || 0
          )
      }));
  }

  return memoryProducts;
}

async function getSiteSettings() {
  const data =
    await supabaseRequest(
      'site_settings?key=eq.main&select=*'
    );

  if (
    Array.isArray(data) &&
    data[0]
  ) {
    siteSettings.backgroundImage =
      data[0].background_image || '';
  }

  return siteSettings;
}

function createAdminToken() {
  return jwt.sign(
    {
      role: 'admin'
    },
    JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
}

function adminRequired(
  req,
  res,
  next
) {
  const token =
    req.cookies.admin_token;

  if (!token) {
    return res.redirect(
      '/admin/login'
    );
  }

  try {
    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );

    if (
      decoded.role !== 'admin'
    ) {
      throw new Error(
        'No autorizado'
      );
    }

    next();
  } catch {
    res.clearCookie(
      'admin_token'
    );

    return res.redirect(
      '/admin/login'
    );
  }
}
function socialIcons() {
  return {
    facebook: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor"
          d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z"/>
      </svg>
    `,

    instagram: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor"
          d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/>
      </svg>
    `,

    tiktok: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor"
          d="M14 3h3.1A5.9 5.9 0 0 0 21 6.9V10a9 9 0 0 1-4-1v6.5A6.5 6.5 0 1 1 10.5 9c.5 0 1 .06 1.5.17v3.2a3.5 3.5 0 1 0 2 3.13V3z"/>
      </svg>
    `,

    google: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor"
          d="M21.35 11.1H12v3.8h5.35c-.23 1.22-.93 2.25-1.98 2.94v2.44h3.2c1.87-1.72 2.95-4.26 2.95-7.28 0-.65-.06-1.28-.17-1.9z"/>
        <path fill="currentColor"
          d="M12 22c2.7 0 4.96-.9 6.57-2.43l-3.2-2.44c-.89.6-2.03.95-3.37.95-2.6 0-4.8-1.75-5.59-4.11H3.1v2.52A9.92 9.92 0 0 0 12 22z"/>
        <path fill="currentColor"
          d="M6.41 13.97A5.95 5.95 0 0 1 6.1 12c0-.68.12-1.34.31-1.97V7.51H3.1A10 10 0 0 0 2 12c0 1.61.39 3.13 1.1 4.49l3.31-2.52z"/>
        <path fill="currentColor"
          d="M12 5.92c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.96 2.93 14.7 2 12 2a9.92 9.92 0 0 0-8.9 5.51l3.31 2.52C7.2 7.67 9.4 5.92 12 5.92z"/>
      </svg>
    `
  };
}

function layout(
  title,
  content,
  settings = siteSettings
) {
  const background =
    settings.backgroundImage
      ? `
        linear-gradient(
          rgba(0,0,0,.72),
          rgba(0,0,0,.82)
        ),
        url("${escapeHtml(
          settings.backgroundImage
        )}")
      `
      : `
        linear-gradient(
          135deg,
          #080808,
          #161616
        )
      `;

  return `
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <title>
    ${escapeHtml(title)}
  </title>

  <style>
    * {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      min-height: 100vh;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      color: #fff;

      background-image:
        ${background};

      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      background-repeat: no-repeat;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      z-index: -1;

      background:
        rgba(0,0,0,.20);
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    button,
    input,
    textarea,
    select {
      font: inherit;
    }

    .container {
      width: min(
        1120px,
        calc(100% - 28px)
      );

      margin: auto;
    }

    .navbar {
      position: sticky;
      top: 0;
      z-index: 50;

      background:
        rgba(5,5,5,.92);

      backdrop-filter:
        blur(12px);

      border-bottom:
        1px solid #292929;
    }

    .navbar-inner {
      min-height: 68px;

      display: flex;
      align-items: center;
      justify-content:
        space-between;

      gap: 16px;
    }

    .brand {
      font-size: 20px;
      font-weight: 900;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 14px;

      flex-wrap: wrap;
    }

    .nav-links a {
      color: #ddd;
      font-weight: 700;
    }

    .hero {
      padding:
        80px 0
        60px;

      text-align: center;
    }

    .hero h1 {
      margin:
        0 0 14px;

      font-size:
        clamp(
          38px,
          8vw,
          72px
        );

      line-height: 1;
    }

    .hero p {
      max-width: 720px;
      margin:
        0 auto 26px;

      color: #ddd;

      font-size: 18px;
      line-height: 1.6;
    }

    section {
      padding:
        42px 0;
    }

    .section-title {
      margin:
        0 0 24px;

      font-size:
        clamp(
          28px,
          5vw,
          42px
        );
    }

    .grid {
      display: grid;

      grid-template-columns:
        repeat(
          auto-fit,
          minmax(240px,1fr)
        );

      gap: 20px;
    }

    .card {
      overflow: hidden;

      border:
        1px solid #303030;

      border-radius: 22px;

      background:
        rgba(15,15,15,.92);

      box-shadow:
        0 16px 40px
        rgba(0,0,0,.28);
    }

    .card-image {
      width: 100%;
      height: 210px;

      object-fit: cover;

      display: block;

      background: #222;
    }

    .card-placeholder {
      height: 210px;

      display: flex;
      align-items: center;
      justify-content: center;

      background:
        linear-gradient(
          135deg,
          #191919,
          #292929
        );

      font-size: 70px;
    }

    .card-body {
      padding: 20px;
    }

    .card h3 {
      margin:
        0 0 10px;

      font-size: 23px;
    }

    .card p {
      color: #ccc;
      line-height: 1.5;
    }

    .price {
      font-size: 20px;
      font-weight: 900;

      margin:
        12px 0;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;

      min-height: 46px;

      padding:
        11px 18px;

      border: 0;
      border-radius: 12px;

      background: #fff;
      color: #000;

      font-weight: 900;

      cursor: pointer;
    }

    .button-dark {
      background: #242424;
      color: #fff;

      border:
        1px solid #3a3a3a;
    }

    .button-full {
      width: 100%;
    }

    .form-box {
      max-width: 760px;

      margin:
        0 auto;

      padding: 24px;

      border:
        1px solid #303030;

      border-radius: 22px;

      background:
        rgba(12,12,12,.94);
    }

    label {
      display: block;

      margin:
        16px 0 7px;

      font-weight: 800;
    }

    input,
    textarea,
    select {
      width: 100%;

      padding:
        13px 14px;

      border:
        1px solid #444;

      border-radius: 11px;

      background: #181818;
      color: #fff;

      outline: none;
    }

    textarea {
      min-height: 110px;
      resize: vertical;
    }

    input:focus,
    textarea:focus,
    select:focus {
      border-color: #fff;
    }

    .social-grid {
      display: grid;

      grid-template-columns:
        repeat(
          4,
          minmax(0,1fr)
        );

      gap: 14px;
    }

    .social-link {
      min-height: 90px;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      gap: 8px;

      border-radius: 18px;

      background:
        rgba(15,15,15,.94);

      border:
        1px solid #303030;

      font-weight: 800;
    }

    .social-link svg {
      width: 34px;
      height: 34px;
    }

    .map {
      width: 100%;
      height: 360px;

      border: 0;
      border-radius: 20px;

      display: block;
    }

    .course-detail-image {
      width: 100%;
      max-height: 500px;

      object-fit: cover;

      border-radius: 24px;

      margin-bottom: 24px;
    }

    .admin-section {
      margin:
        24px 0;

      padding: 22px;

      border:
        1px solid #333;

      border-radius: 20px;

      background:
        rgba(10,10,10,.94);
    }

    .admin-item {
      padding:
        18px 0;

      border-bottom:
        1px solid #303030;
    }

    .admin-item:last-child {
      border-bottom: 0;
    }

    .admin-image-preview {
      width: 100%;
      max-width: 320px;
      height: 180px;

      object-fit: cover;

      border-radius: 14px;

      margin-top: 10px;
    }

    .status-paid {
      color: #72e59a;
      font-weight: 900;
    }

    .status-pending {
      color: #ffd166;
      font-weight: 900;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;

      min-width: 850px;
    }

    th,
    td {
      padding: 12px;

      border-bottom:
        1px solid #333;

      text-align: left;
    }

    th {
      color: #aaa;
    }

    footer {
      padding:
        45px 0;

      text-align: center;

      color: #aaa;
    }

    @media (
      max-width: 700px
    ) {
      .navbar-inner {
        padding:
          10px 0;

        align-items:
          flex-start;

        flex-direction: column;
      }

      .social-grid {
        grid-template-columns:
          repeat(
            2,
            1fr
          );
      }

      .hero {
        padding:
          55px 0
          35px;
      }

      .card-image,
      .card-placeholder {
        height: 190px;
      }
    }
  </style>
</head>

<body>

  ${navbar()}

  ${content}

  <footer>
    <div class="container">
      Centro Constitución
      <br>
      ${escapeHtml(ADDRESS)}
    </div>
  </footer>

</body>
</html>
  `;
}

function navbar() {
  return `
    <nav class="navbar">
      <div
        class="container navbar-inner"
      >
        <a
          class="brand"
          href="/"
        >
          Centro Constitución
        </a>

        <div class="nav-links">
          <a href="/#cursos">
            Cursos
          </a>

          <a href="/#articulos">
            Artículos
          </a>

          <a href="/#ubicacion">
            Ubicación
          </a>

          <a href="/admin">
            Admin
          </a>
        </div>
      </div>
    </nav>
  `;
}

function socialSection() {
  const icons =
    socialIcons();

  return `
    <section id="redes">
      <div class="container">

        <h2 class="section-title">
          Seguinos
        </h2>

        <div class="social-grid">

          <a
            class="social-link"
            href="${FACEBOOK_URL}"
            target="_blank"
            rel="noopener"
          >
            ${icons.facebook}
            Facebook
          </a>

          <a
            class="social-link"
            href="${INSTAGRAM_URL}"
            target="_blank"
            rel="noopener"
          >
            ${icons.instagram}
            Instagram
          </a>

          <a
            class="social-link"
            href="${TIKTOK_URL}"
            target="_blank"
            rel="noopener"
          >
            ${icons.tiktok}
            TikTok
          </a>

          <a
            class="social-link"
            href="${GOOGLE_URL}"
            target="_blank"
            rel="noopener"
          >
            ${icons.google}
            Google
          </a>

        </div>
      </div>
    </section>
  `;
}

function locationSection() {
  const mapQuery =
    encodeURIComponent(
      ADDRESS
    );

  const mapsOpen =
    'https://www.google.com/maps/search/?api=1&query=' +
    mapQuery;

  return `
    <section id="ubicacion">
      <div class="container">

        <h2 class="section-title">
          ¿Dónde estamos?
        </h2>

        <p>
          ${escapeHtml(ADDRESS)}
        </p>

        <iframe
          class="map"
          src="https://www.google.com/maps?q=${mapQuery}&output=embed"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>

        <div
          style="
            display:flex;
            gap:12px;
            flex-wrap:wrap;
            margin-top:18px;
          "
        >
          <a
            class="button"
            href="${mapsOpen}"
            target="_blank"
            rel="noopener"
          >
            Abrir ubicación
          </a>

          <a
            class="button button-dark"
            href="${GOOGLE_URL}"
            target="_blank"
            rel="noopener"
          >
            Ver reseñas
          </a>
        </div>

      </div>
    </section>
  `;
}
function courseCards(
  courses
) {
  return courses
    .map(course => {
      const imageHtml =
        course.image
          ? `
            <img
              class="card-image"
              src="${escapeHtml(
                course.image
              )}"
              alt="${escapeHtml(
                course.name
              )}"
            >
          `
          : `
            <div
              class="card-placeholder"
            >
              ${escapeHtml(
                course.icon || '🎓'
              )}
            </div>
          `;

      const schedules =
        course.schedules
          .map(item => `
            <li>
              ${escapeHtml(item)}
            </li>
          `)
          .join('');

      return `
        <article class="card">

          ${imageHtml}

          <div class="card-body">

            <h3>
              ${escapeHtml(
                course.name
              )}
            </h3>

            <p>
              ${escapeHtml(
                course.description
              )}
            </p>

            <ul>
              ${schedules}
            </ul>

            <div class="price">
              Matrícula:
              ${money(
                course.registration
              )}
            </div>

            <div>
              Cuota:
              ${money(
                course.monthlyFee
              )}
            </div>

            <div
              style="
                margin-top:18px;
              "
            >
              <a
                class="button"
                href="/curso/${encodeURIComponent(
                  course.id
                )}"
              >
                Ver curso
              </a>
            </div>

          </div>
        </article>
      `;
    })
    .join('');
}

function productCards(
  products
) {
  return products
    .map(product => {
      const imageHtml =
        product.image
          ? `
            <img
              class="card-image"
              src="${escapeHtml(
                product.image
              )}"
              alt="${escapeHtml(
                product.name
              )}"
            >
          `
          : `
            <div
              class="card-placeholder"
            >
              ${escapeHtml(
                product.icon || '🛍️'
              )}
            </div>
          `;

      const productData =
        JSON.stringify({
          id: product.id,
          name: product.name,
          price: product.price
        });

      return `
        <article class="card">

          ${imageHtml}

          <div class="card-body">

            <h3>
              ${escapeHtml(
                product.name
              )}
            </h3>

            <div class="price">
              ${money(
                product.price
              )}
            </div>

            <p>
              Stock:
              ${Number(
                product.stock
              )}
            </p>

            <button
              class="button button-full"
              type="button"
              data-product="${escapeHtml(
                productData
              )}"
              onclick="addProductFromButton(this)"
            >
              Agregar al carrito
            </button>

          </div>
        </article>
      `;
    })
    .join('');
}

function courseDetailPage(
  course
) {
  const imageHtml =
    course.image
      ? `
        <img
          class="course-detail-image"
          src="${escapeHtml(
            course.image
          )}"
          alt="${escapeHtml(
            course.name
          )}"
        >
      `
      : `
        <div
          class="card-placeholder"
          style="
            border-radius:24px;
            margin-bottom:24px;
          "
        >
          ${escapeHtml(
            course.icon || '🎓'
          )}
        </div>
      `;

  const scheduleOptions =
    course.schedules
      .map(item => `
        <option
          value="${escapeHtml(item)}"
        >
          ${escapeHtml(item)}
        </option>
      `)
      .join('');

  return `
    <main>

      <section>
        <div class="container">

          ${imageHtml}

          <h1 class="section-title">
            ${escapeHtml(
              course.name
            )}
          </h1>

          <p
            style="
              font-size:18px;
              line-height:1.6;
              color:#ddd;
            "
          >
            ${escapeHtml(
              course.description
            )}
          </p>

          <p>
            <strong>
              Matrícula:
            </strong>

            ${money(
              course.registration
            )}
          </p>

          <p>
            <strong>
              Cuota mensual:
            </strong>

            ${money(
              course.monthlyFee
            )}
          </p>

        </div>
      </section>

      <section>
        <div class="container">

          <div class="form-box">

            <h2>
              Inscribirme
            </h2>

            <form
              method="POST"
              action="/inscription/start"
            >

              <input
                type="hidden"
                name="courseId"
                value="${escapeHtml(
                  course.id
                )}"
              >

              <label>
                Nombre
              </label>

              <input
                type="text"
                name="firstName"
                required
              >

              <label>
                Apellido
              </label>

              <input
                type="text"
                name="lastName"
                required
              >

              <label>
                Número de documento
              </label>

              <input
                type="text"
                name="document"
                inputmode="numeric"
                required
              >

              <label>
                Fecha de nacimiento
              </label>

              <input
                type="date"
                name="birthDate"
                required
              >

              <label>
                Número de WhatsApp
              </label>

              <input
                type="tel"
                name="whatsapp"
                required
              >

              <label>
                Curso
              </label>

              <input
                type="text"
                value="${escapeHtml(
                  course.name
                )}"
                readonly
              >

              <label>
                Horario
              </label>

              <select
                name="schedule"
                required
              >
                ${scheduleOptions}
              </select>

              <button
                class="button button-full"
                type="submit"
                style="
                  margin-top:22px;
                "
              >
                Inscribirme y pagar
              </button>

            </form>

          </div>
        </div>
      </section>

    </main>
  `;
}

function cartSection() {
  return `
    <section id="carrito">
      <div class="container">

        <h2 class="section-title">
          Carrito
        </h2>

        <div class="form-box">

          <div id="cart-items">
            Tu carrito está vacío.
          </div>

          <div
            id="cart-total"
            class="price"
            style="
              margin-top:20px;
            "
          >
            Total: $0
          </div>

          <label>
            Nombre
          </label>

          <input
            id="buyer-name"
            type="text"
          >

          <label>
            WhatsApp
          </label>

          <input
            id="buyer-whatsapp"
            type="tel"
          >

          <button
            class="button button-full"
            type="button"
            onclick="checkoutCart()"
            style="
              margin-top:20px;
            "
          >
            Comprar y pagar
          </button>

        </div>
      </div>

      <script>
        var cart = [];

        function addProductFromButton(
          button
        ) {
          try {
            var product =
              JSON.parse(
                button.dataset.product
              );

            addToCart(product);
          } catch {
            alert(
              'No se pudo agregar el artículo.'
            );
          }
        }

        function addToCart(
          product
        ) {
          var existing =
            cart.find(function(item) {
              return (
                item.id ===
                product.id
              );
            });

          if (existing) {
            existing.quantity += 1;
          } else {
            cart.push({
              id:
                product.id,

              name:
                product.name,

              price:
                Number(
                  product.price
                ),

              quantity: 1
            });
          }

          renderCart();
        }

        function removeFromCart(
          id
        ) {
          cart =
            cart.filter(
              function(item) {
                return (
                  item.id !== id
                );
              }
            );

          renderCart();
        }

        function renderCart() {
          var box =
            document.getElementById(
              'cart-items'
            );

          var totalBox =
            document.getElementById(
              'cart-total'
            );

          if (!cart.length) {
            box.innerHTML =
              'Tu carrito está vacío.';

            totalBox.textContent =
              'Total: $0';

            return;
          }

          box.innerHTML =
            cart.map(
              function(item) {
                var subtotal =
                  item.price *
                  item.quantity;

                return (
                  '<div style="' +
                  'display:flex;' +
                  'justify-content:space-between;' +
                  'align-items:center;' +
                  'gap:12px;' +
                  'padding:12px 0;' +
                  'border-bottom:1px solid #333;' +
                  '">' +

                  '<div>' +

                  '<strong>' +
                  item.name +
                  '</strong>' +

                  '<div style="color:#aaa;">' +
                  'Cantidad: ' +
                  item.quantity +
                  '</div>' +

                  '</div>' +

                  '<div>' +

                  '<strong>$' +
                  subtotal.toLocaleString(
                    'es-AR'
                  ) +
                  '</strong>' +

                  '<button ' +
                  'type="button" ' +
                  'class="remove-cart-item" ' +
                  'data-id="' +
                  item.id +
                  '" ' +
                  'style="' +
                  'display:block;' +
                  'margin-top:6px;' +
                  'background:none;' +
                  'border:0;' +
                  'color:#ff8a80;' +
                  'cursor:pointer;' +
                  '">' +
                  'Quitar' +
                  '</button>' +

                  '</div>' +

                  '</div>'
                );
              }
            ).join('');

          box
            .querySelectorAll(
              '.remove-cart-item'
            )
            .forEach(
              function(button) {
                button.addEventListener(
                  'click',
                  function() {
                    removeFromCart(
                      button.dataset.id
                    );
                  }
                );
              }
            );

          var total =
            cart.reduce(
              function(sum, item) {
                return (
                  sum +
                  item.price *
                  item.quantity
                );
              },
              0
            );

          totalBox.textContent =
            'Total: $' +
            total.toLocaleString(
              'es-AR'
            );
        }

        async function checkoutCart() {
          if (!cart.length) {
            alert(
              'Agregá al menos un artículo.'
            );

            return;
          }

          var name =
            document
              .getElementById(
                'buyer-name'
              )
              .value
              .trim();

          var whatsapp =
            document
              .getElementById(
                'buyer-whatsapp'
              )
              .value
              .trim();

          if (
            !name ||
            !whatsapp
          ) {
            alert(
              'Completá tu nombre y WhatsApp.'
            );

            return;
          }

          var response =
            await fetch(
              '/checkout/products',
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json'
                },

                body:
                  JSON.stringify({
                    name:
                      name,

                    whatsapp:
                      whatsapp,

                    items:
                      cart
                  })
              }
            );

          var data =
            await response.json();

          if (!response.ok) {
            alert(
              data.error ||
              'No se pudo iniciar el pago.'
            );

            return;
          }

          if (data.url) {
            window.location.href =
              data.url;
          }
        }
      </script>
    </section>
  `;
}

function homePage(
  courses,
  products,
  settings
) {
  return layout(
    'Centro Constitución',
    `
      <main>

        <section class="hero">
          <div class="container">

            <h1>
              Centro Constitución
            </h1>

            <p>
              Cursos presenciales,
              capacitación profesional
              y artículos para peluquería
              y barbería.
            </p>

            <a
              class="button"
              href="#cursos"
            >
              Ver cursos
            </a>

          </div>
        </section>

        <section id="cursos">
          <div class="container">

            <h2 class="section-title">
              Cursos
            </h2>

            <div class="grid">
              ${courseCards(
                courses
              )}
            </div>

          </div>
        </section>

        <section id="articulos">
          <div class="container">

            <h2 class="section-title">
              Artículos
            </h2>

            <div class="grid">
              ${productCards(
                products
              )}
            </div>

          </div>
        </section>

        ${cartSection()}

        ${socialSection()}

        ${locationSection()}

      </main>
    `,
    settings
  );
}

app.get(
  '/',
  async (
    req,
    res
  ) => {
    const [
      courses,
      products,
      settings
    ] =
      await Promise.all([
        getCourses(),
        getProducts(),
        getSiteSettings()
      ]);

    res.send(
      homePage(
        courses,
        products,
        settings
      )
    );
  }
);

app.get(
  '/curso/:id',
  async (
    req,
    res
  ) => {
    const courses =
      await getCourses();

    const course =
      courses.find(
        item =>
          String(item.id) ===
          String(req.params.id)
      );

    if (!course) {
      return res
        .status(404)
        .send(
          layout(
            'Curso no encontrado',
            `
              <main>
                <section>
                  <div class="container">

                    <h1>
                      Curso no encontrado
                    </h1>

                    <a
                      class="button"
                      href="/"
                    >
                      Volver
                    </a>

                  </div>
                </section>
              </main>
            `
          )
        );
    }

    const settings =
      await getSiteSettings();

    res.send(
      layout(
        course.name,
        courseDetailPage(
          course
        ),
        settings
      )
    );
  }
);
function createWhatsAppUrl(
  inscription
) {
  const message =
    [
      'Hola, quiero confirmar mi inscripción en Centro Constitución.',
      '',
      'Nombre: ' +
        inscription.firstName,
      'Apellido: ' +
        inscription.lastName,
      'Documento: ' +
        inscription.document,
      'Fecha de nacimiento: ' +
        inscription.birthDate,
      'WhatsApp: ' +
        inscription.whatsapp,
      'Curso: ' +
        inscription.courseName,
      'Horario: ' +
        inscription.schedule
    ].join('\n');

  return (
    'https://wa.me/' +
    BUSINESS_WHATSAPP +
    '?text=' +
    encodeURIComponent(
      message
    )
  );
}

async function createMercadoPagoPreference(
  data
) {
  if (!MP_ACCESS_TOKEN) {
    return null;
  }

  try {
    const response =
      await fetch(
        'https://api.mercadopago.com/checkout/preferences',
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${MP_ACCESS_TOKEN}`,

            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify(data)
        }
      );

    if (!response.ok) {
      const error =
        await response.text();

      console.error(
        'Mercado Pago:',
        response.status,
        error
      );

      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(
      'Mercado Pago error:',
      error
    );

    return null;
  }
}

app.post(
  '/inscription/start',
  async (
    req,
    res
  ) => {
    const {
      firstName,
      lastName,
      document,
      birthDate,
      whatsapp,
      courseId,
      schedule
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !document ||
      !birthDate ||
      !whatsapp ||
      !courseId ||
      !schedule
    ) {
      return res
        .status(400)
        .send(
          layout(
            'Datos incompletos',
            `
              <main>
                <section>
                  <div class="container">

                    <h1>
                      Faltan datos
                    </h1>

                    <p>
                      Completá todos los campos.
                    </p>

                    <a
                      class="button"
                      href="/"
                    >
                      Volver
                    </a>

                  </div>
                </section>
              </main>
            `
          )
        );
    }

    const courses =
      await getCourses();

    const course =
      courses.find(
        item =>
          String(item.id) ===
          String(courseId)
      );

    if (!course) {
      return res
        .status(404)
        .send(
          'Curso no encontrado'
        );
    }

    const inscriptionId =
      'ins-' +
      Date.now() +
      '-' +
      Math.random()
        .toString(36)
        .slice(2, 8);

    const inscription = {
      id:
        inscriptionId,

      first_name:
        String(
          firstName
        ).trim(),

      last_name:
        String(
          lastName
        ).trim(),

      document:
        String(
          document
        ).trim(),

      birth_date:
        String(
          birthDate
        ).trim(),

      whatsapp:
        String(
          whatsapp
        ).trim(),

      course_id:
        course.id,

      course_name:
        course.name,

      schedule:
        String(
          schedule
        ).trim(),

      amount:
        Number(
          course.registration
        ),

      payment_status:
        'pending',

      created_at:
        new Date()
          .toISOString()
    };

    await supabaseRequest(
      'inscriptions',
      {
        method: 'POST',

        headers: {
          Prefer:
            'return=minimal'
        },

        body:
          JSON.stringify(
            inscription
          )
      }
    );

    const preference =
      await createMercadoPagoPreference({
        items: [
          {
            title:
              'Inscripción - ' +
              course.name,

            quantity: 1,

            currency_id:
              'ARS',

            unit_price:
              Number(
                course.registration
              )
          }
        ],

        external_reference:
          inscriptionId,

        back_urls: {
          success:
            PUBLIC_URL +
            '/payment/success?inscription_id=' +
            encodeURIComponent(
              inscriptionId
            ),

          pending:
            PUBLIC_URL +
            '/payment/pending?inscription_id=' +
            encodeURIComponent(
              inscriptionId
            ),

          failure:
            PUBLIC_URL +
            '/payment/failure?inscription_id=' +
            encodeURIComponent(
              inscriptionId
            )
        },

        auto_return:
          'approved'
      });

    if (
      !preference ||
      !preference.init_point
    ) {
      return res
        .status(500)
        .send(
          layout(
            'Error de pago',
            `
              <main>
                <section>
                  <div class="container">

                    <h1>
                      No se pudo iniciar el pago
                    </h1>

                    <p>
                      Revisá la configuración
                      de Mercado Pago.
                    </p>

                    <a
                      class="button"
                      href="/curso/${encodeURIComponent(
                        course.id
                      )}"
                    >
                      Volver al curso
                    </a>

                  </div>
                </section>
              </main>
            `
          )
        );
    }

    return res.redirect(
      preference.init_point
    );
  }
);

async function getInscriptionById(
  id
) {
  const data =
    await supabaseRequest(
      'inscriptions?id=eq.' +
      encodeURIComponent(
        id
      ) +
      '&select=*'
    );

  if (
    Array.isArray(data) &&
    data[0]
  ) {
    return data[0];
  }

  return null;
}

async function updateInscriptionStatus(
  id,
  status
) {
  return supabaseRequest(
    'inscriptions?id=eq.' +
    encodeURIComponent(
      id
    ),
    {
      method: 'PATCH',

      headers: {
        Prefer:
          'return=minimal'
      },

      body:
        JSON.stringify({
          payment_status:
            status
        })
    }
  );
}

app.get(
  '/payment/success',
  async (
    req,
    res
  ) => {
    const inscriptionId =
      String(
        req.query.inscription_id ||
        ''
      );

    if (!inscriptionId) {
      return res.redirect('/');
    }

    await updateInscriptionStatus(
      inscriptionId,
      'paid'
    );

    const inscription =
      await getInscriptionById(
        inscriptionId
      );

    if (!inscription) {
      return res.send(
        layout(
          'Pago realizado',
          `
            <main>
              <section>
                <div class="container">

                  <h1>
                    Pago realizado
                  </h1>

                  <p>
                    Tu pago fue recibido.
                  </p>

                  <a
                    class="button"
                    href="/"
                  >
                    Volver al inicio
                  </a>

                </div>
              </section>
            </main>
          `
        )
      );
    }

    const whatsappUrl =
      createWhatsAppUrl({
        firstName:
          inscription.first_name,

        lastName:
          inscription.last_name,

        document:
          inscription.document,

        birthDate:
          inscription.birth_date,

        whatsapp:
          inscription.whatsapp,

        courseName:
          inscription.course_name,

        schedule:
          inscription.schedule
      });

    return res.send(
      layout(
        'Inscripción pagada',
        `
          <main>

            <section>
              <div class="container">

                <div class="form-box">

                  <h1>
                    Inscripción pagada
                  </h1>

                  <p class="status-paid">
                    Pago aprobado.
                  </p>

                  <p>
                    Ahora enviá tus datos
                    por WhatsApp para
                    terminar de confirmar
                    la inscripción.
                  </p>

                  <p>
                    <strong>Nombre:</strong>
                    ${escapeHtml(
                      inscription.first_name
                    )}
                    ${escapeHtml(
                      inscription.last_name
                    )}
                  </p>

                  <p>
                    <strong>Documento:</strong>
                    ${escapeHtml(
                      inscription.document
                    )}
                  </p>

                  <p>
                    <strong>Fecha de nacimiento:</strong>
                    ${escapeHtml(
                      inscription.birth_date
                    )}
                  </p>

                  <p>
                    <strong>WhatsApp:</strong>
                    ${escapeHtml(
                      inscription.whatsapp
                    )}
                  </p>

                  <p>
                    <strong>Curso:</strong>
                    ${escapeHtml(
                      inscription.course_name
                    )}
                  </p>

                  <p>
                    <strong>Horario:</strong>
                    ${escapeHtml(
                      inscription.schedule
                    )}
                  </p>

                  <a
                    class="button button-full"
                    href="${escapeHtml(
                      whatsappUrl
                    )}"
                    target="_blank"
                    rel="noopener"
                    style="
                      margin-top:18px;
                    "
                  >
                    Enviar inscripción por WhatsApp
                  </a>

                </div>
              </div>
            </section>

          </main>
        `
      )
    );
  }
);

app.get(
  '/payment/pending',
  async (
    req,
    res
  ) => {
    const inscriptionId =
      String(
        req.query.inscription_id ||
        ''
      );

    if (inscriptionId) {
      await updateInscriptionStatus(
        inscriptionId,
        'pending'
      );
    }

    res.send(
      layout(
        'Pago pendiente',
        `
          <main>
            <section>
              <div class="container">

                <div class="form-box">

                  <h1>
                    Pago pendiente
                  </h1>

                  <p class="status-pending">
                    Mercado Pago todavía
                    está procesando el pago.
                  </p>

                  <a
                    class="button"
                    href="/"
                  >
                    Volver al inicio
                  </a>

                </div>
              </div>
            </section>
          </main>
        `
      )
    );
  }
);

app.get(
  '/payment/failure',
  async (
    req,
    res
  ) => {
    const inscriptionId =
      String(
        req.query.inscription_id ||
        ''
      );

    if (inscriptionId) {
      await updateInscriptionStatus(
        inscriptionId,
        'failed'
      );
    }

    res.send(
      layout(
        'Pago rechazado',
        `
          <main>
            <section>
              <div class="container">

                <div class="form-box">

                  <h1>
                    No se pudo realizar el pago
                  </h1>

                  <p>
                    Podés volver al curso
                    e intentarlo nuevamente.
                  </p>

                  <a
                    class="button"
                    href="/"
                  >
                    Volver al inicio
                  </a>

                </div>
              </div>
            </section>
          </main>
        `
      )
    );
  }
);

app.post(
  '/checkout/products',
  async (
    req,
    res
  ) => {
    const {
      name,
      whatsapp,
      items
    } = req.body;

    if (
      !name ||
      !whatsapp ||
      !Array.isArray(items) ||
      !items.length
    ) {
      return res
        .status(400)
        .json({
          error:
            'Faltan datos del pedido.'
        });
    }

    const products =
      await getProducts();

    const validatedItems = [];

    for (
      const requested
      of items
    ) {
      const product =
        products.find(
          item =>
            String(item.id) ===
            String(
              requested.id
            )
        );

      if (!product) {
        continue;
      }

      const quantity =
        Math.max(
          1,
          Number(
            requested.quantity ||
            1
          )
        );

      validatedItems.push({
        id:
          product.id,

        name:
          product.name,

        price:
          Number(
            product.price
          ),

        quantity:
          quantity
      });
    }

    if (
      !validatedItems.length
    ) {
      return res
        .status(400)
        .json({
          error:
            'No hay artículos válidos.'
        });
    }

    const total =
      validatedItems.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.price *
          item.quantity,
        0
      );

    const orderId =
      'order-' +
      Date.now() +
      '-' +
      Math.random()
        .toString(36)
        .slice(2, 8);

    await supabaseRequest(
      'orders',
      {
        method: 'POST',

        headers: {
          Prefer:
            'return=minimal'
        },

        body:
          JSON.stringify({
            id:
              orderId,

            buyer_name:
              String(
                name
              ).trim(),

            buyer_whatsapp:
              String(
                whatsapp
              ).trim(),

            items:
              validatedItems,

            total:
              total,

            payment_status:
              'pending',

            created_at:
              new Date()
                .toISOString()
          })
      }
    );

    const preference =
      await createMercadoPagoPreference({
        items:
          validatedItems.map(
            item => ({
              title:
                item.name,

              quantity:
                item.quantity,

              currency_id:
                'ARS',

              unit_price:
                item.price
            })
          ),

        external_reference:
          orderId,

        back_urls: {
          success:
            PUBLIC_URL +
            '/order/success',

          pending:
            PUBLIC_URL +
            '/order/pending',

          failure:
            PUBLIC_URL +
            '/order/failure'
        },

        auto_return:
          'approved'
      });

    if (
      !preference ||
      !preference.init_point
    ) {
      return res
        .status(500)
        .json({
          error:
            'No se pudo iniciar el pago.'
        });
    }

    return res.json({
      url:
        preference.init_point
    });
  }
);

app.get(
  '/order/success',
  (
    req,
    res
  ) => {
    res.send(
      layout(
        'Compra realizada',
        `
          <main>
            <section>
              <div class="container">

                <div class="form-box">

                  <h1>
                    Compra realizada
                  </h1>

                  <p class="status-paid">
                    El pago fue aprobado.
                  </p>

                  <a
                    class="button"
                    href="/"
                  >
                    Volver al inicio
                  </a>

                </div>
              </div>
            </section>
          </main>
        `
      )
    );
  }
);

app.get(
  '/order/pending',
  (
    req,
    res
  ) => {
    res.send(
      layout(
        'Pago pendiente',
        `
          <main>
            <section>
              <div class="container">

                <h1>
                  Pago pendiente
                </h1>

                <a
                  class="button"
                  href="/"
                >
                  Volver
                </a>

              </div>
            </section>
          </main>
        `
      )
    );
  }
);

app.get(
  '/order/failure',
  (
    req,
    res
  ) => {
    res.send(
      layout(
        'Pago rechazado',
        `
          <main>
            <section>
              <div class="container">

                <h1>
                  Pago rechazado
                </h1>

                <a
                  class="button"
                  href="/"
                >
                  Volver
                </a>

              </div>
            </section>
          </main>
        `
      )
    );
  }
);
app.get(
  '/admin/login',
  (
    req,
    res
  ) => {
    res.send(
      layout(
        'Ingresar al panel',
        `
          <main>
            <section>
              <div class="container">

                <div class="form-box">

                  <h1>
                    Panel de administración
                  </h1>

                  <form
                    method="POST"
                    action="/admin/login"
                  >

                    <label>
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      required
                    >

                    <label>
                      Contraseña
                    </label>

                    <input
                      type="password"
                      name="password"
                      required
                    >

                    <button
                      class="button button-full"
                      type="submit"
                      style="
                        margin-top:20px;
                      "
                    >
                      Ingresar
                    </button>

                  </form>

                </div>
              </div>
            </section>
          </main>
        `
      )
    );
  }
);

app.post(
  '/admin/login',
  (
    req,
    res
  ) => {
    const {
      email,
      password
    } = req.body;

    if (
      !ADMIN_EMAIL ||
      !ADMIN_PASSWORD ||
      email !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    ) {
      return res
        .status(401)
        .send(
          layout(
            'Acceso incorrecto',
            `
              <main>
                <section>
                  <div class="container">

                    <div class="form-box">

                      <h1>
                        Datos incorrectos
                      </h1>

                      <a
                        class="button"
                        href="/admin/login"
                      >
                        Intentar nuevamente
                      </a>

                    </div>
                  </div>
                </section>
              </main>
            `
          )
        );
    }

    const token =
      createAdminToken();

    res.cookie(
      'admin_token',
      token,
      {
        httpOnly: true,
        sameSite: 'lax',
        secure:
          PUBLIC_URL.startsWith(
            'https://'
          ),

        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000
      }
    );

    res.redirect(
      '/admin'
    );
  }
);

app.get(
  '/admin/logout',
  (
    req,
    res
  ) => {
    res.clearCookie(
      'admin_token'
    );

    res.redirect(
      '/admin/login'
    );
  }
);

async function getInscriptions() {
  const data =
    await supabaseRequest(
      'inscriptions?select=*&order=created_at.desc'
    );

  if (
    Array.isArray(data)
  ) {
    return data;
  }

  return [];
}

async function getOrders() {
  const data =
    await supabaseRequest(
      'orders?select=*&order=created_at.desc'
    );

  if (
    Array.isArray(data)
  ) {
    return data;
  }

  return [];
}

function inscriptionTable(
  inscriptions
) {
  if (!inscriptions.length) {
    return `
      <p>
        Todavía no hay
        personas inscriptas.
      </p>
    `;
  }

  return `
    <div class="table-wrap">
      <table>

        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Documento</th>
            <th>Nacimiento</th>
            <th>WhatsApp</th>
            <th>Curso</th>
            <th>Horario</th>
            <th>Pago</th>
          </tr>
        </thead>

        <tbody>

          ${inscriptions
            .map(item => `
              <tr>

                <td>
                  ${escapeHtml(
                    item.first_name || ''
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    item.last_name || ''
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    item.document || ''
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    item.birth_date || ''
                  )}
                </td>

                <td>
                  <a
                    href="https://wa.me/${escapeHtml(
                      String(
                        item.whatsapp || ''
                      ).replace(
                        /\D/g,
                        ''
                      )
                    )}"
                    target="_blank"
                    rel="noopener"
                  >
                    ${escapeHtml(
                      item.whatsapp || ''
                    )}
                  </a>
                </td>

                <td>
                  ${escapeHtml(
                    item.course_name || ''
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    item.schedule || ''
                  )}
                </td>

                <td>
                  ${
                    item.payment_status ===
                    'paid'
                      ? `
                        <span
                          class="status-paid"
                        >
                          PAGADO
                        </span>
                      `
                      : `
                        <span
                          class="status-pending"
                        >
                          ${escapeHtml(
                            String(
                              item.payment_status ||
                              'pending'
                            ).toUpperCase()
                          )}
                        </span>
                      `
                  }
                </td>

              </tr>
            `)
            .join('')}

        </tbody>
      </table>
    </div>
  `;
}

function orderTable(
  orders
) {
  if (!orders.length) {
    return `
      <p>
        Todavía no hay pedidos.
      </p>
    `;
  }

  return `
    <div class="table-wrap">

      <table>

        <thead>
          <tr>
            <th>Cliente</th>
            <th>WhatsApp</th>
            <th>Artículos</th>
            <th>Total</th>
            <th>Pago</th>
          </tr>
        </thead>

        <tbody>

          ${orders
            .map(order => {
              const items =
                Array.isArray(
                  order.items
                )
                  ? order.items
                  : [];

              return `
                <tr>

                  <td>
                    ${escapeHtml(
                      order.buyer_name || ''
                    )}
                  </td>

                  <td>
                    ${escapeHtml(
                      order.buyer_whatsapp || ''
                    )}
                  </td>

                  <td>
                    ${items
                      .map(item =>
                        escapeHtml(
                          item.name +
                          ' x' +
                          item.quantity
                        )
                      )
                      .join('<br>')}
                  </td>

                  <td>
                    ${money(
                      order.total
                    )}
                  </td>

                  <td>
                    ${escapeHtml(
                      String(
                        order.payment_status ||
                        'pending'
                      ).toUpperCase()
                    )}
                  </td>

                </tr>
              `;
            })
            .join('')}

        </tbody>

      </table>

    </div>
  `;
}

app.get(
  '/admin',
  adminRequired,
  async (
    req,
    res
  ) => {
    const [
      courses,
      products,
      settings,
      inscriptions,
      orders
    ] =
      await Promise.all([
        getCourses(),
        getProducts(),
        getSiteSettings(),
        getInscriptions(),
        getOrders()
      ]);

    const courseForms =
      courses
        .map(course => `
          <div class="admin-item">

            <h3>
              ${escapeHtml(
                course.name
              )}
            </h3>

            ${
              course.image
                ? `
                  <img
                    class="admin-image-preview"
                    src="${escapeHtml(
                      course.image
                    )}"
                    alt=""
                  >
                `
                : ''
            }

            <form
              method="POST"
              action="/admin/course/update"
            >

              <input
                type="hidden"
                name="id"
                value="${escapeHtml(
                  course.id
                )}"
              >

              <label>
                Nombre
              </label>

              <input
                name="name"
                value="${escapeHtml(
                  course.name
                )}"
                required
              >

              <label>
                URL de la imagen
              </label>

              <input
                type="url"
                name="image"
                value="${escapeHtml(
                  course.image || ''
                )}"
                placeholder="https://..."
              >

              <label>
                Descripción
              </label>

              <textarea
                name="description"
              >${escapeHtml(
                course.description
              )}</textarea>

              <label>
                Horarios
              </label>

              <textarea
                name="schedules"
              >${escapeHtml(
                course.schedules.join(
                  '\n'
                )
              )}</textarea>

              <label>
                Matrícula
              </label>

              <input
                type="number"
                name="registration"
                value="${Number(
                  course.registration
                )}"
              >

              <label>
                Cuota
              </label>

              <input
                type="number"
                name="monthlyFee"
                value="${Number(
                  course.monthlyFee
                )}"
              >

              <button
                class="button"
                type="submit"
                style="
                  margin-top:16px;
                "
              >
                Guardar curso
              </button>

            </form>

          </div>
        `)
        .join('');

    const productForms =
      products
        .map(product => `
          <div class="admin-item">

            <h3>
              ${escapeHtml(
                product.name
              )}
            </h3>

            ${
              product.image
                ? `
                  <img
                    class="admin-image-preview"
                    src="${escapeHtml(
                      product.image
                    )}"
                    alt=""
                  >
                `
                : ''
            }

            <form
              method="POST"
              action="/admin/product/update"
            >

              <input
                type="hidden"
                name="id"
                value="${escapeHtml(
                  product.id
                )}"
              >

              <label>
                Nombre
              </label>

              <input
                name="name"
                value="${escapeHtml(
                  product.name
                )}"
                required
              >

              <label>
                URL de la imagen
              </label>

              <input
                type="url"
                name="image"
                value="${escapeHtml(
                  product.image || ''
                )}"
                placeholder="https://..."
              >

              <label>
                Precio
              </label>

              <input
                type="number"
                name="price"
                value="${Number(
                  product.price
                )}"
              >

              <label>
                Stock
              </label>

              <input
                type="number"
                name="stock"
                value="${Number(
                  product.stock
                )}"
              >

              <button
                class="button"
                type="submit"
                style="
                  margin-top:16px;
                "
              >
                Guardar artículo
              </button>

            </form>

          </div>
        `)
        .join('');

    res.send(
      layout(
        'Panel de administración',
        `
          <main>

            <section>
              <div class="container">

                <div
                  style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:15px;
                    flex-wrap:wrap;
                  "
                >
                  <h1 class="section-title">
                    Panel de administración
                  </h1>

                  <a
                    class="button button-dark"
                    href="/admin/logout"
                  >
                    Cerrar sesión
                  </a>
                </div>

                <div class="admin-section">

                  <h2>
                    Fondo de la página
                  </h2>

                  <p>
                    Pegá la URL de la imagen
                    que querés usar como fondo.
                  </p>

                  ${
                    settings.backgroundImage
                      ? `
                        <img
                          class="admin-image-preview"
                          src="${escapeHtml(
                            settings.backgroundImage
                          )}"
                          alt=""
                        >
                      `
                      : ''
                  }

                  <form
                    method="POST"
                    action="/admin/settings"
                  >

                    <label>
                      URL de la foto de fondo
                    </label>

                    <input
                      type="url"
                      name="backgroundImage"
                      value="${escapeHtml(
                        settings.backgroundImage ||
                        ''
                      )}"
                      placeholder="https://..."
                    >

                    <button
                      class="button"
                      type="submit"
                      style="
                        margin-top:16px;
                      "
                    >
                      Cambiar fondo
                    </button>

                  </form>

                </div>

                <div class="admin-section">

                  <h2>
                    Agregar curso
                  </h2>

                  <form
                    method="POST"
                    action="/admin/course/add"
                  >

                    <label>
                      Nombre
                    </label>

                    <input
                      name="name"
                      required
                    >

                    <label>
                      URL de la imagen
                    </label>

                    <input
                      type="url"
                      name="image"
                      placeholder="https://..."
                    >

                    <label>
                      Descripción
                    </label>

                    <textarea
                      name="description"
                    ></textarea>

                    <label>
                      Horarios
                    </label>

                    <textarea
                      name="schedules"
                      placeholder="Un horario por línea"
                    ></textarea>

                    <label>
                      Matrícula
                    </label>

                    <input
                      type="number"
                      name="registration"
                      value="20000"
                    >

                    <label>
                      Cuota
                    </label>

                    <input
                      type="number"
                      name="monthlyFee"
                      value="80000"
                    >

                    <button
                      class="button"
                      type="submit"
                      style="
                        margin-top:16px;
                      "
                    >
                      + Agregar curso
                    </button>

                  </form>

                </div>

                <div class="admin-section">

                  <h2>
                    Editar cursos
                  </h2>

                  ${courseForms}

                </div>

                <div class="admin-section">

                  <h2>
                    Agregar artículo
                  </h2>

                  <form
                    method="POST"
                    action="/admin/product/add"
                  >

                    <label>
                      Nombre
                    </label>

                    <input
                      name="name"
                      required
                    >

                    <label>
                      URL de la imagen
                    </label>

                    <input
                      type="url"
                      name="image"
                      placeholder="https://..."
                    >

                    <label>
                      Precio
                    </label>

                    <input
                      type="number"
                      name="price"
                      required
                    >

                    <label>
                      Stock
                    </label>

                    <input
                      type="number"
                      name="stock"
                      value="0"
                    >

                    <button
                      class="button"
                      type="submit"
                      style="
                        margin-top:16px;
                      "
                    >
                      + Agregar artículo
                    </button>

                  </form>

                </div>

                <div class="admin-section">

                  <h2>
                    Editar artículos
                  </h2>

                  ${productForms}

                </div>

                <div class="admin-section">

                  <h2>
                    Personas inscriptas
                  </h2>

                  ${inscriptionTable(
                    inscriptions
                  )}

                </div>

                <div class="admin-section">

                  <h2>
                    Pedidos de artículos
                  </h2>

                  ${orderTable(
                    orders
                  )}

                </div>

              </div>
            </section>

          </main>
        `,
        settings
      )
    );
  }
);
app.post(
  '/admin/settings',
  adminRequired,
  async (
    req,
    res
  ) => {
    const backgroundImage =
      String(
        req.body.backgroundImage || ''
      ).trim();

    siteSettings.backgroundImage =
      backgroundImage;

    const existing =
      await supabaseRequest(
        'site_settings?key=eq.main&select=*'
      );

    if (
      Array.isArray(existing) &&
      existing.length
    ) {
      await supabaseRequest(
        'site_settings?key=eq.main',
        {
          method: 'PATCH',

          headers: {
            Prefer:
              'return=minimal'
          },

          body:
            JSON.stringify({
              background_image:
                backgroundImage
            })
        }
      );
    } else {
      await supabaseRequest(
        'site_settings',
        {
          method: 'POST',

          headers: {
            Prefer:
              'return=minimal'
          },

          body:
            JSON.stringify({
              key: 'main',

              background_image:
                backgroundImage
            })
        }
      );
    }

    res.redirect('/admin');
  }
);

app.post(
  '/admin/course/add',
  adminRequired,
  async (
    req,
    res
  ) => {
    const {
      name,
      image,
      description,
      schedules,
      registration,
      monthlyFee
    } = req.body;

    const cleanName =
      String(name || '')
        .trim();

    if (!cleanName) {
      return res.redirect(
        '/admin'
      );
    }

    const baseId =
      slugify(
        cleanName
      ) ||
      'curso';

    const id =
      baseId +
      '-' +
      Date.now();

    const scheduleList =
      normalizeSchedules(
        schedules
      );

    const course = {
      id:
        id,

      icon:
        '🎓',

      image:
        String(
          image || ''
        ).trim(),

      name:
        cleanName,

      description:
        String(
          description || ''
        ).trim(),

      schedules:
        scheduleList.length
          ? scheduleList
          : [
              'Horario próximamente'
            ],

      registration:
        Number(
          registration || 0
        ),

      monthlyFee:
        Number(
          monthlyFee || 0
        )
    };

    memoryCourses.push(
      course
    );

    await supabaseRequest(
      'courses',
      {
        method: 'POST',

        headers: {
          Prefer:
            'return=minimal'
        },

        body:
          JSON.stringify({
            id:
              course.id,

            icon:
              course.icon,

            image:
              course.image,

            name:
              course.name,

            description:
              course.description,

            schedules:
              course.schedules,

            registration:
              course.registration,

            monthly_fee:
              course.monthlyFee
          })
      }
    );

    res.redirect('/admin');
  }
);

app.post(
  '/admin/course/update',
  adminRequired,
  async (
    req,
    res
  ) => {
    const {
      id,
      name,
      image,
      description,
      schedules,
      registration,
      monthlyFee
    } = req.body;

    const course =
      memoryCourses.find(
        item =>
          String(item.id) ===
          String(id)
      );

    if (course) {
      course.name =
        String(
          name || course.name
        ).trim();

      course.image =
        String(
          image || ''
        ).trim();

      course.description =
        String(
          description || ''
        ).trim();

      const scheduleList =
        normalizeSchedules(
          schedules
        );

      course.schedules =
        scheduleList.length
          ? scheduleList
          : [
              'Horario próximamente'
            ];

      course.registration =
        Number(
          registration || 0
        );

      course.monthlyFee =
        Number(
          monthlyFee || 0
        );
    }

    await supabaseRequest(
      'courses?id=eq.' +
      encodeURIComponent(
        id
      ),
      {
        method: 'PATCH',

        headers: {
          Prefer:
            'return=minimal'
        },

        body:
          JSON.stringify({
            name:
              String(
                name || ''
              ).trim(),

            image:
              String(
                image || ''
              ).trim(),

            description:
              String(
                description || ''
              ).trim(),

            schedules:
              normalizeSchedules(
                schedules
              ),

            registration:
              Number(
                registration || 0
              ),

            monthly_fee:
              Number(
                monthlyFee || 0
              )
          })
      }
    );

    res.redirect('/admin');
  }
);

app.post(
  '/admin/product/add',
  adminRequired,
  async (
    req,
    res
  ) => {
    const {
      name,
      image,
      price,
      stock
    } = req.body;

    const cleanName =
      String(name || '')
        .trim();

    if (!cleanName) {
      return res.redirect(
        '/admin'
      );
    }

    const baseId =
      slugify(
        cleanName
      ) ||
      'articulo';

    const id =
      baseId +
      '-' +
      Date.now();

    const product = {
      id:
        id,

      icon:
        '🛍️',

      image:
        String(
          image || ''
        ).trim(),

      name:
        cleanName,

      price:
        Number(
          price || 0
        ),

      stock:
        Number(
          stock || 0
        )
    };

    memoryProducts.push(
      product
    );

    await supabaseRequest(
      'products',
      {
        method: 'POST',

        headers: {
          Prefer:
            'return=minimal'
        },

        body:
          JSON.stringify({
            id:
              product.id,

            icon:
              product.icon,

            image:
              product.image,

            name:
              product.name,

            price:
              product.price,

            stock:
              product.stock
          })
      }
    );

    res.redirect('/admin');
  }
);

app.post(
  '/admin/product/update',
  adminRequired,
  async (
    req,
    res
  ) => {
    const {
      id,
      name,
      image,
      price,
      stock
    } = req.body;

    const product =
      memoryProducts.find(
        item =>
          String(item.id) ===
          String(id)
      );

    if (product) {
      product.name =
        String(
          name ||
          product.name
        ).trim();

      product.image =
        String(
          image || ''
        ).trim();

      product.price =
        Number(
          price || 0
        );

      product.stock =
        Number(
          stock || 0
        );
    }

    await supabaseRequest(
      'products?id=eq.' +
      encodeURIComponent(
        id
      ),
      {
        method: 'PATCH',

        headers: {
          Prefer:
            'return=minimal'
        },

        body:
          JSON.stringify({
            name:
              String(
                name || ''
              ).trim(),

            image:
              String(
                image || ''
              ).trim(),

            price:
              Number(
                price || 0
              ),

            stock:
              Number(
                stock || 0
              )
          })
      }
    );

    res.redirect('/admin');
  }
);

app.get(
  '/health',
  (
    req,
    res
  ) => {
    res.json({
      ok: true
    });
  }
);

app.use(
  (
    req,
    res
  ) => {
    res
      .status(404)
      .send(
        layout(
          'Página no encontrada',
          `
            <main>
              <section>
                <div class="container">

                  <div class="form-box">

                    <h1>
                      Página no encontrada
                    </h1>

                    <a
                      class="button"
                      href="/"
                    >
                      Volver al inicio
                    </a>

                  </div>
                </div>
              </section>
            </main>
          `
        )
      );
  }
);

app.listen(
  PORT,
  () => {
    console.log(
      'Centro Constitución funcionando en puerto ' +
      PORT
    );
  }
);
