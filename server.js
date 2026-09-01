import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const app = express();

const PORT = process.env.PORT || 3000;

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
    name: 'Tijera profesional',
    price: 45000,
    stock: 10
  },

  {
    id: 'maquina-corte',
    icon: '🪒',
    name: 'Máquina de corte',
    price: 90000,
    stock: 8
  },

  {
    id: 'secador-profesional',
    icon: '💨',
    name: 'Secador profesional',
    price: 70000,
    stock: 6
  }
];

let memoryCourses =
  [...defaultCourses];

let memoryProducts =
  [...defaultProducts];

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

          Prefer:
            'return=representation',

          ...(options.headers || {})
        }
      }
    );

  if (!response.ok) {
    const text =
      await response.text();

    console.error(
      'Supabase error:',
      response.status,
      text
    );

    return null;
  }

  const text =
    await response.text();

  if (!text) {
    return [];
  }

  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

async function getCourses() {
  const data =
    await supabaseRequest(
      'courses?select=*&order=id.asc'
    );

  if (
    !data ||
    !Array.isArray(data) ||
    !data.length
  ) {
    return memoryCourses;
  }

  return data.map(
    course => ({
      id: course.id,

      icon:
        course.icon || '🎓',

      name:
        course.name,

      description:
        course.description || '',

      schedules:
        Array.isArray(
          course.schedules
        )
          ? course.schedules
          : [],

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
    })
  );
}

async function getProducts() {
  const data =
    await supabaseRequest(
      'products?select=*&order=id.asc'
    );

  if (
    !data ||
    !Array.isArray(data) ||
    !data.length
  ) {
    return memoryProducts;
  }

  return data.map(
    product => ({
      id:
        product.id,

      icon:
        product.icon || '🛍️',

      name:
        product.name,

      price:
        Number(
          product.price || 0
        ),

      stock:
        Number(
          product.stock || 0
        )
    })
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
    jwt.verify(
      token,
      JWT_SECRET
    );

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
function layout(
  title,
  content
) {
  return `
  <!DOCTYPE html>
  <html lang="es">

  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

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
        font-family:
          Arial,
          Helvetica,
          sans-serif;
        background: #0f0f0f;
        color: #ffffff;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      button,
      input,
      select,
      textarea {
        font: inherit;
      }

      .container {
        width: min(1100px, 92%);
        margin: 0 auto;
      }

      .navbar {
        position: sticky;
        top: 0;
        z-index: 100;
        background:
          rgba(
            10,
            10,
            10,
            0.96
          );
        border-bottom:
          1px solid #222;
      }

      .nav-inner {
        min-height: 72px;
        display: flex;
        align-items: center;
        justify-content:
          space-between;
        gap: 18px;
      }

      .brand {
        font-size: 1.15rem;
        font-weight: 800;
      }

      .brand span {
        color: #ffd54a;
      }

      .nav-links {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
      }

      .nav-links a {
        color: #ddd;
        font-size: 0.95rem;
      }

      .nav-links a:hover {
        color: #ffd54a;
      }

      .hero {
        padding: 85px 0 70px;
        background:
          radial-gradient(
            circle at top right,
            rgba(
              255,
              213,
              74,
              0.18
            ),
            transparent 35%
          ),
          linear-gradient(
            180deg,
            #101010 0%,
            #080808 100%
          );
      }

      .hero-content {
        max-width: 760px;
      }

      .eyebrow {
        display: inline-block;
        padding: 8px 12px;
        border-radius: 999px;
        background: #1d1d1d;
        color: #ffd54a;
        font-weight: 700;
        margin-bottom: 14px;
      }

      h1 {
        margin: 0 0 20px;
        font-size:
          clamp(
            2.4rem,
            8vw,
            5rem
          );
        line-height: 0.98;
      }

      h2 {
        margin-top: 0;
        font-size:
          clamp(
            1.8rem,
            5vw,
            2.8rem
          );
      }

      .hero p,
      .section-text {
        color: #c2c2c2;
        line-height: 1.7;
      }

      .hero p {
        font-size: 1.08rem;
        max-width: 650px;
      }

      section {
        padding: 70px 0;
      }

      .section-muted {
        background: #151515;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 24px;
      }

      .btn {
        border: 0;
        border-radius: 12px;
        padding: 13px 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-weight: 800;
      }

      .btn-primary {
        background: #ffd54a;
        color: #111;
      }

      .btn-dark {
        background: #1c1c1c;
        color: #fff;
        border: 1px solid #333;
      }

      .btn-danger {
        background: #b42318;
        color: white;
      }

      .grid {
        display: grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(
              240px,
              1fr
            )
          );
        gap: 18px;
        margin-top: 30px;
      }

      .card {
        background: #171717;
        border: 1px solid #292929;
        border-radius: 18px;
        padding: 22px;
      }

      .card-icon {
        font-size: 2rem;
        margin-bottom: 12px;
      }

      .card h3 {
        margin-top: 0;
      }

      .card p {
        color: #bcbcbc;
        line-height: 1.55;
      }

      .price {
        color: #ffd54a;
        font-weight: 800;
        margin-top: 12px;
      }

      .schedule {
        margin-top: 12px;
        color: #ddd;
      }

      .schedule div {
        margin-bottom: 6px;
      }

      .form-card {
        max-width: 760px;
        margin: 30px auto 0;
        background: #171717;
        border: 1px solid #292929;
        border-radius: 18px;
        padding: 24px;
      }

      .form-grid {
        display: grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(
              220px,
              1fr
            )
          );
        gap: 16px;
      }

      label {
        display: block;
        margin-bottom: 7px;
        font-weight: 700;
      }

      input,
      select,
      textarea {
        width: 100%;
        padding: 12px;
        border-radius: 10px;
        border:
          1px solid #363636;
        background: #0e0e0e;
        color: white;
      }

      textarea {
        resize: vertical;
        min-height: 100px;
      }

      .full {
        grid-column: 1 / -1;
      }

      .social-grid {
        display: grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(
              170px,
              1fr
            )
          );
        gap: 14px;
        margin-top: 28px;
      }

      .social-card {
        background: #191919;
        border:
          1px solid #2d2d2d;
        border-radius: 16px;
        padding: 20px;
      }

      .social-icon {
        font-size: 1.8rem;
        margin-bottom: 10px;
      }

      .social-card strong {
        display: block;
        margin-bottom: 5px;
      }

      .social-card span {
        color: #aaa;
      }

      .map-box {
        margin-top: 28px;
        overflow: hidden;
        border-radius: 18px;
        border:
          1px solid #303030;
        background: #111;
      }

      .map-box iframe {
        display: block;
        width: 100%;
        height: 390px;
        border: 0;
      }

      .map-footer {
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content:
          space-between;
        gap: 14px;
        flex-wrap: wrap;
      }

      .map-address {
        color: #d0d0d0;
      }

      .admin-top {
        display: flex;
        justify-content:
          space-between;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
        margin-bottom: 30px;
      }

      .admin-card {
        background: #171717;
        border:
          1px solid #292929;
        border-radius: 18px;
        padding: 20px;
        margin-bottom: 18px;
      }

      .admin-actions {
        margin-top: 16px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .add-box {
        background: #121212;
        border:
          2px dashed #444;
        border-radius: 18px;
        padding: 22px;
        margin: 22px 0 30px;
      }

      .notice {
        padding: 14px 16px;
        border-radius: 12px;
        background: #1d2a20;
        color: #b9f6ca;
        margin-bottom: 20px;
      }

      .error {
        padding: 14px 16px;
        border-radius: 12px;
        background: #351a1a;
        color: #ffb4ab;
        margin-bottom: 20px;
      }

      footer {
        border-top:
          1px solid #222;
        padding: 34px 0;
        color: #999;
        text-align: center;
      }

      @media (
        max-width: 720px
      ) {
        .nav-inner {
          align-items:
            flex-start;
          flex-direction:
            column;
          padding: 14px 0;
        }

        .hero {
          padding-top: 55px;
        }

        section {
          padding: 55px 0;
        }

        .map-box iframe {
          height: 300px;
        }
      }
    </style>
  </head>

  <body>
    ${content}
  </body>

  </html>
  `;
}

function navbar() {
  return `
    <header class="navbar">

      <div
        class="container nav-inner"
      >

        <a
          href="/"
          class="brand"
        >
          Centro
          <span>
            Constitución
          </span>
        </a>

        <nav class="nav-links">

          <a href="/#cursos">
            Cursos
          </a>

          <a href="/#productos">
            Productos
          </a>

          <a href="/#redes">
            Redes
          </a>

          <a href="/#ubicacion">
            Ubicación
          </a>

          <a href="/admin">
            Admin
          </a>

        </nav>

      </div>

    </header>
  `;
}

function socialSection() {
  return `
    <section
      id="redes"
      class="section-muted"
    >

      <div class="container">

        <h2>
          Seguinos en nuestras redes
        </h2>

        <p class="section-text">
          Mirá nuestros trabajos,
          cursos, promociones y
          novedades.
        </p>

        <div class="social-grid">

          <a
            class="social-card"
            href="${FACEBOOK_URL}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="social-icon">
              📘
            </div>

            <strong>
              Facebook
            </strong>

            <span>
              Visitar página
            </span>
          </a>

          <a
            class="social-card"
            href="${INSTAGRAM_URL}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="social-icon">
              📸
            </div>

            <strong>
              Instagram
            </strong>

            <span>
              @cursosconstitucion
            </span>
          </a>

          <a
            class="social-card"
            href="${TIKTOK_URL}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="social-icon">
              🎵
            </div>

            <strong>
              TikTok
            </strong>

            <span>
              @centroconstitucion
            </span>
          </a>

          <a
            class="social-card"
            href="${GOOGLE_URL}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="social-icon">
              ⭐
            </div>

            <strong>
              Google
            </strong>

            <span>
              Ver nuestras reseñas
            </span>
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
    `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return `
    <section id="ubicacion">

      <div class="container">

        <h2>
          Ubicación
        </h2>

        <p class="section-text">
          Estamos en
          <strong>
            ${escapeHtml(ADDRESS)}
          </strong>.
          Tocá el mapa o el botón
          para abrir la ubicación.
        </p>

        <div class="map-box">

          <iframe
            src="https://www.google.com/maps?q=${mapQuery}&output=embed"
            loading="lazy"
            title="Mapa Centro Constitución"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>

          <div class="map-footer">

            <div class="map-address">
              📍
              ${escapeHtml(ADDRESS)}
            </div>

            <div class="actions">

              <a
                class="btn btn-primary"
                href="${mapsOpen}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir ubicación
              </a>

              <a
                class="btn btn-dark"
                href="${GOOGLE_URL}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ⭐ Ver reseñas
              </a>

            </div>

          </div>

        </div>

      </div>

    </section>
  `;
}
function courseCards(courses) {
  return courses.map(course => `
    <article class="card">
      <div class="card-icon">
        ${escapeHtml(course.icon)}
      </div>

      <h3>
        ${escapeHtml(course.name)}
      </h3>

      <p>
        ${escapeHtml(course.description)}
      </p>

      <div class="schedule">
        ${course.schedules.map(schedule => `
          <div>
            🕒 ${escapeHtml(schedule)}
          </div>
        `).join('')}
      </div>

      <div class="price">
        Inscripción:
        ${money(course.registration)}
      </div>

      <div class="price">
        Cuota:
        ${money(course.monthlyFee)}
      </div>

      <div class="actions">
        <a
          class="btn btn-primary"
          href="/curso/${encodeURIComponent(course.id)}"
        >
          Ver curso
        </a>
      </div>
    </article>
  `).join('');
}

function productCards(products) {
  return products.map(product => `
    <article class="card">
      <div class="card-icon">
        ${escapeHtml(product.icon)}
      </div>

      <h3>
        ${escapeHtml(product.name)}
      </h3>

      <p>
        Stock:
        ${Number(product.stock || 0)}
      </p>

      <div class="price">
        ${money(product.price)}
      </div>

      <div class="actions">
        <button
          type="button"
          class="btn btn-primary"
          onclick='addToCart(${JSON.stringify({
            id: product.id,
            name: product.name,
            price: Number(product.price || 0)
          })})'
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  `).join('');
}

function courseDetailPage(course) {
  return layout(
    `${course.name} - Centro Constitución`,
    `
      ${navbar()}

      <section>
        <div class="container">

          <div class="card-icon">
            ${escapeHtml(course.icon)}
          </div>

          <h1 style="font-size:3rem;">
            ${escapeHtml(course.name)}
          </h1>

          <p class="section-text">
            ${escapeHtml(course.description)}
          </p>

          <div class="schedule">
            ${course.schedules.map(schedule => `
              <div>
                🕒 ${escapeHtml(schedule)}
              </div>
            `).join('')}
          </div>

          <div class="price">
            Inscripción:
            ${money(course.registration)}
          </div>

          <div class="price">
            Cuota:
            ${money(course.monthlyFee)}
          </div>

          <div class="form-card">

            <h2>
              Inscribite a este curso
            </h2>

            <form
              method="POST"
              action="/inscription"
            >

              <input
                type="hidden"
                name="course"
                value="${escapeHtml(course.id)}"
              />

              <div class="form-grid">

                <div>
                  <label>
                    Nombre y apellido
                  </label>

                  <input
                    type="text"
                    name="name"
                    required
                  />
                </div>

                <div>
                  <label>
                    DNI
                  </label>

                  <input
                    type="text"
                    name="dni"
                    required
                  />
                </div>

                <div>
                  <label>
                    WhatsApp
                  </label>

                  <input
                    type="tel"
                    name="whatsapp"
                    required
                  />
                </div>

                <div>
                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    required
                  />
                </div>

                <div class="full">
                  <label>
                    Horario
                  </label>

                  <select
                    name="schedule"
                    required
                  >
                    ${course.schedules.map(schedule => `
                      <option
                        value="${escapeHtml(schedule)}"
                      >
                        ${escapeHtml(schedule)}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <div class="full">
                  <button
                    type="submit"
                    class="btn btn-primary"
                  >
                    Inscribirme y pagar
                  </button>
                </div>

              </div>
            </form>

          </div>

        </div>
      </section>
    `
  );
}

function cartSection() {
  return `
    <section id="carrito">
      <div class="container">

        <h2>
          Carrito
        </h2>

        <p class="section-text">
          Agregá los productos que quieras
          y después pagá con Mercado Pago.
        </p>

        <div class="form-card">

          <div id="cart-items">
            Tu carrito está vacío.
          </div>

          <div
            id="cart-total"
            class="price"
            style="margin-top:20px;"
          >
            Total: $0
          </div>

          <div
            class="form-grid"
            style="margin-top:20px;"
          >

            <div>
              <label>
                Nombre
              </label>

              <input
                id="buyer-name"
                type="text"
              />
            </div>

            <div>
              <label>
                WhatsApp
              </label>

              <input
                id="buyer-whatsapp"
                type="tel"
              />
            </div>

            <div>
              <label>
                Email
              </label>

              <input
                id="buyer-email"
                type="email"
              />
            </div>

            <div class="full">
              <button
                type="button"
                class="btn btn-primary"
                onclick="checkoutCart()"
              >
                Comprar con Mercado Pago
              </button>
            </div>

          </div>

        </div>

      </div>

      <script>
        let cart = [];

        function addToCart(product) {
          const existing =
            cart.find(
              item =>
                item.id === product.id
            );

          if (existing) {
            existing.quantity += 1;
          } else {
            cart.push({
              ...product,
              quantity: 1
            });
          }

          renderCart();

          document
            .getElementById('carrito')
            .scrollIntoView({
              behavior: 'smooth'
            });
        }

        function removeFromCart(id) {
          cart =
            cart.filter(
              item =>
                item.id !== id
            );

          renderCart();
        }

        function renderCart() {
          const box =
            document.getElementById(
              'cart-items'
            );

          const totalBox =
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
        cart.map(function(item) {
          const subtotal =
            item.price *
            item.quantity;

          return (
            '<div style="' +
            'display:flex;' +
            'justify-content:space-between;' +
            'align-items:center;' +
            'gap:12px;' +
            'padding:12px 0;' +
            'border-bottom:1px solid #2d2d2d;' +
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
            subtotal.toLocaleString('es-AR') +
            '</strong>' +

            '<button type="button" ' +
            'onclick="removeFromCart(\\'' +
            item.id +
            '\\')" ' +
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
        }).join('');

      const total =
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
          'Agregá al menos un producto.'
        );

        return;
      }

      const name =
        document
          .getElementById(
            'buyer-name'
          )
          .value
          .trim();

      const whatsapp =
        document
          .getElementById(
            'buyer-whatsapp'
          )
          .value
          .trim();

      const email =
        document
          .getElementById(
            'buyer-email'
          )
          .value
          .trim();

      if (!name || !whatsapp) {
        alert(
          'Completá tu nombre y WhatsApp.'
        );

        return;
      }

      const response =
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
                name,
                whatsapp,
                email,
                items: cart
              })
          }
        );

      const data =
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
  products
) {
  return layout(
    'Centro Constitución',
    `
      ${navbar()}

      <main>

        <section class="hero">
          <div class="container">
            <div class="hero-content">

              <span class="eyebrow">
                Cursos de oficios
              </span>

              <h1>
                Centro Constitución
              </h1>

              <p>
                Cursos presenciales,
                capacitación y herramientas
                para aprender un oficio.
              </p>

              <div class="actions">

                <a
                  class="btn btn-primary"
                  href="#cursos"
                >
                  Ver cursos
                </a>

                <a
                  class="btn btn-dark"
                  href="#ubicacion"
                >
                  Ver ubicación
                </a>

              </div>

            </div>
          </div>
        </section>

        <section id="cursos">
          <div class="container">

            <h2>
              Nuestros cursos
            </h2>

            <p class="section-text">
              Tocá en Ver curso para
              conocer los horarios e
              inscribirte.
            </p>

            <div class="grid">
              ${courseCards(courses)}
            </div>

          </div>
        </section>

        <section
          id="productos"
          class="section-muted"
        >
          <div class="container">

            <h2>
              Productos y herramientas
            </h2>

            <p class="section-text">
              Comprá herramientas
              profesionales desde
              nuestra página.
            </p>

            <div class="grid">
              ${productCards(products)}
            </div>

          </div>
        </section>

        ${cartSection()}

        ${socialSection()}

        ${locationSection()}

      </main>

      <footer>
        <div class="container">
          © ${new Date().getFullYear()}
          Centro Constitución
        </div>
      </footer>
    `
  );
}

app.get(
  '/',
  async (req, res) => {
    const courses =
      await getCourses();

    const products =
      await getProducts();

    res.send(
      homePage(
        courses,
        products
      )
    );
  }
);

app.get(
  '/curso/:id',
  async (req, res) => {
    const courses =
      await getCourses();

    const course =
      courses.find(
        item =>
          item.id === req.params.id
      );

    if (!course) {
      return res.status(404).send(
        layout(
          'Curso no encontrado',
          `
            ${navbar()}

            <section>
              <div class="container">

                <div class="error">
                  Curso no encontrado.
                </div>

                <a
                  class="btn btn-primary"
                  href="/"
                >
                  Volver
                </a>

              </div>
            </section>
          `
        )
      );
    }

    res.send(
      courseDetailPage(course)
    );
  }
);
app.post(
  '/inscription',
  async (req, res) => {
    try {
      const {
        name,
        dni,
        whatsapp,
        email,
        course,
        schedule
      } = req.body;

      const courses =
        await getCourses();

      const selectedCourse =
        courses.find(
          item =>
            item.id === course
        );

      if (!selectedCourse) {
        return res
          .status(400)
          .send(
            layout(
              'Error',
              `
                ${navbar()}

                <section>
                  <div class="container">

                    <div class="error">
                      El curso seleccionado
                      no existe.
                    </div>

                    <a
                      class="btn btn-primary"
                      href="/"
                    >
                      Volver
                    </a>

                  </div>
                </section>
              `
            )
          );
      }

      if (!MP_ACCESS_TOKEN) {
        return res
          .status(500)
          .send(
            layout(
              'Mercado Pago',
              `
                ${navbar()}

                <section>
                  <div class="container">

                    <div class="error">
                      Falta configurar
                      Mercado Pago.
                    </div>

                    <a
                      class="btn btn-primary"
                      href="/"
                    >
                      Volver
                    </a>

                  </div>
                </section>
              `
            )
          );
      }

      await supabaseRequest(
        'inscriptions',
        {
          method: 'POST',

          body: JSON.stringify([
            {
              name,
              dni,
              whatsapp,
              email,

              course_id:
                selectedCourse.id,

              course_name:
                selectedCourse.name,

              schedule,

              amount:
                selectedCourse.registration,

              status:
                'pending'
            }
          ])
        }
      );

      const mpResponse =
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

            body: JSON.stringify({
              items: [
                {
                  title:
                    `Inscripción ${selectedCourse.name}`,

                  quantity: 1,

                  currency_id:
                    'ARS',

                  unit_price:
                    Number(
                      selectedCourse.registration
                    )
                }
              ],

              payer: {
                name,
                email
              },

              external_reference:
                `inscription-${Date.now()}`,

              back_urls: {
                success:
                  `${PUBLIC_URL}/payment/success`,

                pending:
                  `${PUBLIC_URL}/payment/pending`,

                failure:
                  `${PUBLIC_URL}/payment/failure`
              },

              auto_return:
                'approved'
            })
          }
        );

      const preference =
        await mpResponse.json();

      if (
        !mpResponse.ok ||
        !preference.init_point
      ) {
        console.error(
          preference
        );

        return res
          .status(500)
          .send(
            layout(
              'Error de pago',
              `
                ${navbar()}

                <section>
                  <div class="container">

                    <div class="error">
                      No se pudo iniciar
                      el pago.
                    </div>

                    <a
                      class="btn btn-primary"
                      href="/"
                    >
                      Volver
                    </a>

                  </div>
                </section>
              `
            )
          );
      }

      return res.redirect(
        preference.init_point
      );
    } catch (error) {
      console.error(error);

      return res
        .status(500)
        .send(
          'Error interno.'
        );
    }
  }
);

app.post(
  '/checkout/products',
  async (req, res) => {
    try {
      const {
        name,
        whatsapp,
        email,
        items
      } = req.body;

      if (
        !Array.isArray(items) ||
        !items.length
      ) {
        return res
          .status(400)
          .json({
            error:
              'El carrito está vacío.'
          });
      }

      if (!MP_ACCESS_TOKEN) {
        return res
          .status(500)
          .json({
            error:
              'Mercado Pago no está configurado.'
          });
      }

      const products =
        await getProducts();

      const mpItems = [];

      for (const item of items) {
        const product =
          products.find(
            product =>
              product.id === item.id
          );

        if (!product) {
          continue;
        }

        const quantity =
          Math.max(
            1,
            Number(
              item.quantity || 1
            )
          );

        mpItems.push({
          title:
            product.name,

          quantity,

          currency_id:
            'ARS',

          unit_price:
            Number(
              product.price
            )
        });
      }

      if (!mpItems.length) {
        return res
          .status(400)
          .json({
            error:
              'No hay productos válidos.'
          });
      }

      await supabaseRequest(
        'orders',
        {
          method: 'POST',

          body: JSON.stringify([
            {
              name,
              whatsapp,
              email,
              items,
              status:
                'pending'
            }
          ])
        }
      );

      const mpResponse =
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

            body: JSON.stringify({
              items:
                mpItems,

              payer: {
                name,
                email
              },

              external_reference:
                `products-${Date.now()}`,

              back_urls: {
                success:
                  `${PUBLIC_URL}/payment/success`,

                pending:
                  `${PUBLIC_URL}/payment/pending`,

                failure:
                  `${PUBLIC_URL}/payment/failure`
              },

              auto_return:
                'approved'
            })
          }
        );

      const preference =
        await mpResponse.json();

      if (
        !mpResponse.ok ||
        !preference.init_point
      ) {
        console.error(
          preference
        );

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
    } catch (error) {
      console.error(error);

      return res
        .status(500)
        .json({
          error:
            'Error interno.'
        });
    }
  }
);

app.get(
  '/payment/success',
  (req, res) => {
    res.send(
      layout(
        'Pago aprobado',
        `
          ${navbar()}

          <section>
            <div class="container">

              <div class="notice">
                ✅ Pago aprobado.
              </div>

              <h2>
                ¡Gracias!
              </h2>

              <p class="section-text">
                Recibimos tu pago
                correctamente.
              </p>

              <div class="actions">

                <a
                  class="btn btn-primary"
                  href="/"
                >
                  Volver al inicio
                </a>

                <a
                  class="btn btn-dark"
                  href="https://wa.me/${BUSINESS_WHATSAPP}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>

              </div>

            </div>
          </section>
        `
      )
    );
  }
);

app.get(
  '/payment/pending',
  (req, res) => {
    res.send(
      layout(
        'Pago pendiente',
        `
          ${navbar()}

          <section>
            <div class="container">

              <div class="notice">
                ⏳ El pago está pendiente.
              </div>

              <a
                class="btn btn-primary"
                href="/"
              >
                Volver al inicio
              </a>

            </div>
          </section>
        `
      )
    );
  }
);

app.get(
  '/payment/failure',
  (req, res) => {
    res.send(
      layout(
        'Pago rechazado',
        `
          ${navbar()}

          <section>
            <div class="container">

              <div class="error">
                ❌ El pago no pudo
                completarse.
              </div>

              <a
                class="btn btn-primary"
                href="/"
              >
                Volver
              </a>

            </div>
          </section>
        `
      )
    );
  }
);

app.get(
  '/admin/login',
  (req, res) => {
    res.send(
      layout(
        'Administrador',
        `
          <section>
            <div class="container">

              <div
                class="form-card"
                style="max-width:460px;"
              >

                <h2>
                  Panel administrador
                </h2>

                <form
                  method="POST"
                  action="/admin/login"
                >

                  <div
                    style="margin-bottom:16px;"
                  >
                    <label>
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      required
                    />
                  </div>

                  <div
                    style="margin-bottom:20px;"
                  >
                    <label>
                      Contraseña
                    </label>

                    <input
                      type="password"
                      name="password"
                      required
                    />
                  </div>

                  <button
                    class="btn btn-primary"
                    type="submit"
                  >
                    Ingresar
                  </button>

                </form>

              </div>

            </div>
          </section>
        `
      )
    );
  }
);

app.post(
  '/admin/login',
  (req, res) => {
    const {
      email,
      password
    } = req.body;

    if (
      email !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    ) {
      return res
        .status(401)
        .send(
          layout(
            'Acceso denegado',
            `
              <section>
                <div class="container">

                  <div class="error">
                    Email o contraseña
                    incorrectos.
                  </div>

                  <a
                    class="btn btn-primary"
                    href="/admin/login"
                  >
                    Volver
                  </a>

                </div>
              </section>
            `
          )
        );
    }

    const token =
      jwt.sign(
        {
          email
        },

        JWT_SECRET,

        {
          expiresIn:
            '7d'
        }
      );

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
  (req, res) => {
    res.clearCookie(
      'admin_token'
    );

    res.redirect(
      '/admin/login'
    );
  }
);

app.get(
  '/admin',
  adminRequired,
  async (req, res) => {
    const courses =
      await getCourses();

    const products =
      await getProducts();

    res.send(
      layout(
        'Panel administrador',
        `
          ${navbar()}

          <section>
            <div class="container">

              <div class="admin-top">

                <div>
                  <h2>
                    Panel administrador
                  </h2>

                  <p class="section-text">
                    Desde acá podés
                    agregar y editar
                    cursos y productos.
                  </p>
                </div>

                <a
                  class="btn btn-dark"
                  href="/admin/logout"
                >
                  Cerrar sesión
                </a>

              </div>

              <h2>
                Cursos
              </h2>

              <div class="add-box">

                <h3>
                  ➕ Agregar curso
                </h3>

                <form
                  method="POST"
                  action="/admin/course/add"
                >

                  <div class="form-grid">

                    <div>
                      <label>
                        Icono
                      </label>

                      <input
                        name="icon"
                        value="🎓"
                      />
                    </div>

                    <div>
                      <label>
                        Nombre del curso
                      </label>

                      <input
                        name="name"
                        required
                      />
                    </div>

                    <div class="full">
                      <label>
                        Descripción
                      </label>

                      <textarea
                        name="description"
                      ></textarea>
                    </div>

                    <div class="full">
                      <label>
                        Horarios
                        (uno por línea)
                      </label>

                      <textarea
                        name="schedules"
                        placeholder="Martes de 16:00 a 18:00"
                      ></textarea>
                    </div>

                    <div>
                      <label>
                        Inscripción
                      </label>

                      <input
                        type="number"
                        name="registration"
                        value="20000"
                      />
                    </div>

                    <div>
                      <label>
                        Cuota
                      </label>

                      <input
                        type="number"
                        name="monthlyFee"
                        value="80000"
                      />
                    </div>

                    <div class="full">

                      <button
                        class="btn btn-primary"
                        type="submit"
                      >
                        ➕ Agregar curso
                      </button>

                    </div>

                  </div>

                </form>

              </div>

              ${courses.map(course => `
                <form
                  class="admin-card"
                  method="POST"
                  action="/admin/course/update"
                >

                  <input
                    type="hidden"
                    name="id"
                    value="${escapeHtml(course.id)}"
                  />

                  <div class="form-grid">

                    <div>
                      <label>
                        Icono
                      </label>

                      <input
                        name="icon"
                        value="${escapeHtml(course.icon)}"
                      />
                    </div>

                    <div>
                      <label>
                        Nombre
                      </label>

                      <input
                        name="name"
                        value="${escapeHtml(course.name)}"
                      />
                    </div>

                    <div class="full">
                      <label>
                        Descripción
                      </label>

                      <textarea
                        name="description"
                      >${escapeHtml(course.description)}</textarea>
                    </div>

                    <div class="full">
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
                    </div>

                    <div>
                      <label>
                        Inscripción
                      </label>

                      <input
                        type="number"
                        name="registration"
                        value="${Number(course.registration)}"
                      />
                    </div>

                    <div>
                      <label>
                        Cuota
                      </label>

                      <input
                        type="number"
                        name="monthlyFee"
                        value="${Number(course.monthlyFee)}"
                      />
                    </div>

                  </div>

                  <div class="admin-actions">

                    <button
                      class="btn btn-primary"
                      type="submit"
                    >
                      Guardar curso
                    </button>

                  </div>

                </form>
              `).join('')}

              <h2
                style="margin-top:50px;"
              >
                Productos
              </h2>

              <div class="add-box">

                <h3>
                  ➕ Agregar artículo
                </h3>

                <form
                  method="POST"
                  action="/admin/product/add"
                >

                  <div class="form-grid">

                    <div>
                      <label>
                        Icono
                      </label>

                      <input
                        name="icon"
                        value="🛍️"
                      />
                    </div>

                    <div>
                      <label>
                        Nombre
                      </label>

                      <input
                        name="name"
                        required
                      />
                    </div>

                    <div>
                      <label>
                        Precio
                      </label>

                      <input
                        type="number"
                        name="price"
                        required
                      />
                    </div>

                    <div>
                      <label>
                        Stock
                      </label>

                      <input
                        type="number"
                        name="stock"
                        value="1"
                      />
                    </div>

                    <div class="full">

                      <button
                        class="btn btn-primary"
                        type="submit"
                      >
                        ➕ Agregar artículo
                      </button>

                    </div>

                  </div>

                </form>

              </div>

              ${products.map(product => `
                <form
                  class="admin-card"
                  method="POST"
                  action="/admin/product/update"
                >

                  <input
                    type="hidden"
                    name="id"
                    value="${escapeHtml(product.id)}"
                  />

                  <div class="form-grid">

                    <div>
                      <label>
                        Icono
                      </label>

                      <input
                        name="icon"
                        value="${escapeHtml(product.icon)}"
                      />
                    </div>

                    <div>
                      <label>
                        Nombre
                      </label>

                      <input
                        name="name"
                        value="${escapeHtml(product.name)}"
                      />
                    </div>

                    <div>
                      <label>
                        Precio
                      </label>

                      <input
                        type="number"
                        name="price"
                        value="${Number(product.price)}"
                      />
                    </div>

                    <div>
                      <label>
                        Stock
                      </label>

                      <input
                        type="number"
                        name="stock"
                        value="${Number(product.stock)}"
                      />
                    </div>

                  </div>

                  <div class="admin-actions">

                    <button
                      class="btn btn-primary"
                      type="submit"
                    >
                      Guardar artículo
                    </button>

                  </div>

                </form>
              `).join('')}

            </div>
          </section>
        `
      )
    );
  }
);
app.post(
  '/admin/course/add',
  adminRequired,
  async (req, res) => {
    const {
      icon,
      name,
      description,
      schedules,
      registration,
      monthlyFee
    } = req.body;

    const cleanName =
      String(name || '').trim();

    if (!cleanName) {
      return res.redirect('/admin');
    }

    const baseId =
      slugify(cleanName) ||
      `curso-${Date.now()}`;

    const id =
      `${baseId}-${Date.now()}`;

    const scheduleList =
      String(schedules || '')
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean);

    const newCourse = {
      id,
      icon:
        String(icon || '🎓').trim() || '🎓',
      name:
        cleanName,
      description:
        String(description || '').trim(),
      schedules:
        scheduleList.length
          ? scheduleList
          : ['Horario próximamente'],
      registration:
        Number(registration || 0),
      monthlyFee:
        Number(monthlyFee || 0)
    };

    memoryCourses.push(newCourse);

    await supabaseRequest(
      'courses',
      {
        method: 'POST',
        body: JSON.stringify([
          {
            id:
              newCourse.id,
            icon:
              newCourse.icon,
            name:
              newCourse.name,
            description:
              newCourse.description,
            schedules:
              newCourse.schedules,
            registration:
              newCourse.registration,
            monthly_fee:
              newCourse.monthlyFee
          }
        ])
      }
    );

    return res.redirect('/admin');
  }
);

app.post(
  '/admin/course/update',
  adminRequired,
  async (req, res) => {
    const {
      id,
      icon,
      name,
      description,
      schedules,
      registration,
      monthlyFee
    } = req.body;

    const scheduleList =
      String(schedules || '')
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean);

    const updatedCourse = {
      id,
      icon:
        String(icon || '🎓').trim() || '🎓',
      name:
        String(name || '').trim(),
      description:
        String(description || '').trim(),
      schedules:
        scheduleList.length
          ? scheduleList
          : ['Horario próximamente'],
      registration:
        Number(registration || 0),
      monthlyFee:
        Number(monthlyFee || 0)
    };

    memoryCourses =
      memoryCourses.map(course =>
        course.id === id
          ? updatedCourse
          : course
      );

    await supabaseRequest(
      `courses?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          icon:
            updatedCourse.icon,
          name:
            updatedCourse.name,
          description:
            updatedCourse.description,
          schedules:
            updatedCourse.schedules,
          registration:
            updatedCourse.registration,
          monthly_fee:
            updatedCourse.monthlyFee
        })
      }
    );

    return res.redirect('/admin');
  }
);

app.post(
  '/admin/product/add',
  adminRequired,
  async (req, res) => {
    const {
      icon,
      name,
      price,
      stock
    } = req.body;

    const cleanName =
      String(name || '').trim();

    if (!cleanName) {
      return res.redirect('/admin');
    }

    const baseId =
      slugify(cleanName) ||
      `producto-${Date.now()}`;

    const id =
      `${baseId}-${Date.now()}`;

    const newProduct = {
      id,
      icon:
        String(icon || '🛍️').trim() || '🛍️',
      name:
        cleanName,
      price:
        Number(price || 0),
      stock:
        Number(stock || 0)
    };

    memoryProducts.push(newProduct);

    await supabaseRequest(
      'products',
      {
        method: 'POST',
        body: JSON.stringify([
          {
            id:
              newProduct.id,
            icon:
              newProduct.icon,
            name:
              newProduct.name,
            price:
              newProduct.price,
            stock:
              newProduct.stock
          }
        ])
      }
    );

    return res.redirect('/admin');
  }
);

app.post(
  '/admin/product/update',
  adminRequired,
  async (req, res) => {
    const {
      id,
      icon,
      name,
      price,
      stock
    } = req.body;

    const updatedProduct = {
      id,
      icon:
        String(icon || '🛍️').trim() || '🛍️',
      name:
        String(name || '').trim(),
      price:
        Number(price || 0),
      stock:
        Number(stock || 0)
    };

    memoryProducts =
      memoryProducts.map(product =>
        product.id === id
          ? updatedProduct
          : product
      );

    await supabaseRequest(
      `products?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          icon:
            updatedProduct.icon,
          name:
            updatedProduct.name,
          price:
            updatedProduct.price,
          stock:
            updatedProduct.stock
        })
      }
    );

    return res.redirect('/admin');
  }
);

app.get(
  '/health',
  (req, res) => {
    res.json({
      ok: true
    });
  }
);

app.use(
  (req, res) => {
    res
      .status(404)
      .send(
        layout(
          'Página no encontrada',
          `
            ${navbar()}

            <section>
              <div class="container">

                <div class="error">
                  Página no encontrada.
                </div>

                <a
                  class="btn btn-primary"
                  href="/"
                >
                  Volver al inicio
                </a>

              </div>
            </section>
          `
        )
      );
  }
);

app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `Centro Constitución funcionando en puerto ${PORT}`
    );
  }
);
