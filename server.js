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
  process.env.JWT_SECRET || 'cambiar-secreto';

const SUPABASE_URL = (
  process.env.SUPABASE_URL || ''
).replace(/\/$/, '');

const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || '';

const MP_ACCESS_TOKEN =
  process.env.MP_ACCESS_TOKEN || '';

const BUSINESS_WHATSAPP = '5491166061100';

app.use(express.json({ limit: '8mb' }));
app.use(cookieParser());

app.get('/IMG_5279.jpeg', (_req, res) => {
  res.sendFile(process.cwd() + '/IMG_5279.jpeg');
});

/* =====================================
   DATOS PREDETERMINADOS
===================================== */

const defaultCourses = [
  {
    id: 'barberia',
    icon: '💈',
    name: 'Barbería',
    description:
      'Aprendé técnicas de corte masculino con máquina, tijera y navaja.',
    schedules: [
      'Martes de 16 a 18 hs',
      'Sábados de 9 a 11 hs',
      'Sábados de 11 a 13 hs'
    ],
    inscription: 20000,
    monthly: 80000
  },
  {
    id: 'peluqueria',
    icon: '💇‍♀️',
    name: 'Peluquería',
    description:
      'Formación integral con práctica, corte, brushing, peinados y tratamientos.',
    schedules: [
      'Miércoles de 15 a 18 hs',
      'Sábados de 9 a 12 hs'
    ],
    inscription: 20000,
    monthly: 80000
  },
  {
    id: 'colorimetria',
    icon: '🎨',
    name: 'Colorimetría',
    description:
      'Formación profesional en color y diagnóstico.',
    schedules: ['Horario próximamente'],
    inscription: 20000,
    monthly: 80000
  },
  {
    id: 'manicuria',
    icon: '💅',
    name: 'Manicuría y Pedicuría',
    description:
      'Manicuría, pedicuría y esmaltado tradicional y semipermanente.',
    schedules: ['Horario próximamente'],
    inscription: 20000,
    monthly: 80000
  }
];

const defaultProducts = [
  {
    id: 'p1',
    emoji: '✂️',
    name: 'Tijera profesional',
    price: 45000,
    stock: 10
  },
  {
    id: 'p2',
    emoji: '🪒',
    name: 'Máquina de corte',
    price: 90000,
    stock: 8
  },
  {
    id: 'p3',
    emoji: '💨',
    name: 'Secador profesional',
    price: 70000,
    stock: 6
  }
];

let orders = [];

/* =====================================
   SUPABASE
===================================== */

function supabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_SECRET_KEY,
    Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

async function supabaseRequest(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error('Supabase no está configurado.');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${path}`,
    {
      ...options,
      headers: supabaseHeaders(
        options.headers || {}
      )
    }
  );

  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    console.error('Supabase error:', data);

    throw new Error(
      data?.message ||
      data?.error ||
      'Error de Supabase'
    );
  }

  return data;
}

/* =====================================
   CURSOS
===================================== */

async function getCourses() {
  try {
    const data = await supabaseRequest(
      'courses?select=*&order=name.asc'
    );

    if (Array.isArray(data) && data.length) {
      return data;
    }
  } catch (error) {
    console.error(
      'Error cargando cursos:',
      error.message
    );
  }

  return defaultCourses;
}

async function saveCourses(courses) {
  return supabaseRequest(
    'courses',
    {
      method: 'POST',
      headers: {
        Prefer:
          'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(courses)
    }
  );
}

/* =====================================
   PRODUCTOS
===================================== */

async function getProducts() {
  try {
    const data = await supabaseRequest(
      'products?select=*&order=name.asc'
    );

    if (Array.isArray(data) && data.length) {
      return data;
    }
  } catch (error) {
    console.error(
      'Error cargando productos:',
      error.message
    );
  }

  return defaultProducts;
}

async function saveProducts(products) {
  return supabaseRequest(
    'products',
    {
      method: 'POST',
      headers: {
        Prefer:
          'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(products)
    }
  );
}

/* =====================================
   FONDO DEL SITIO
===================================== */

async function getBackground() {
  try {
    const data = await supabaseRequest(
      'site_settings?key=eq.background_image&select=value'
    );

    if (
      Array.isArray(data) &&
      data.length &&
      data[0].value
    ) {
      return data[0].value;
    }

    return '';
  } catch (error) {
    console.error(
      'Error cargando fondo:',
      error.message
    );

    return '';
  }
}

async function saveBackground(value) {
  return supabaseRequest(
    'site_settings?on_conflict=key',
    {
      method: 'POST',
      headers: {
        Prefer:
          'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify({
        key: 'background_image',
        value: value || '',
        updated_at: new Date().toISOString()
      })
    }
  );
}

/* =====================================
   INSCRIPCIONES
===================================== */

async function createSignup(data) {
  const result = await supabaseRequest(
    'signups',
    {
      method: 'POST',
      headers: {
        Prefer: 'return=representation'
      },
      body: JSON.stringify(data)
    }
  );

  return Array.isArray(result)
    ? result[0]
    : result;
}

async function getSignups() {
  try {
    const data = await supabaseRequest(
      'signups?select=*&order=created_at.desc'
    );

    return Array.isArray(data)
      ? data
      : [];
  } catch (error) {
    console.error(
      'Error cargando inscripciones:',
      error.message
    );

    return [];
  }
}

async function getSignupById(id) {
  try {
    const data = await supabaseRequest(
      `signups?id=eq.${encodeURIComponent(id)}&select=*`
    );

    if (
      Array.isArray(data) &&
      data.length
    ) {
      return data[0];
    }

    return null;
  } catch (error) {
    console.error(
      'Error buscando inscripción:',
      error.message
    );

    return null;
  }
}

async function updateSignupPayment(
  signupId,
  payment
) {
  return supabaseRequest(
    `signups?id=eq.${encodeURIComponent(signupId)}`,
    {
      method: 'PATCH',
      headers: {
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        status:
          payment.status === 'approved'
            ? 'approved'
            : payment.status,
        payment_id:
          String(payment.id || '')
      })
    }
  );
}

/* =====================================
   MERCADO PAGO
===================================== */

async function mpRequest(path, options = {}) {
  if (!MP_ACCESS_TOKEN) {
    throw new Error(
      'Mercado Pago no está configurado.'
    );
  }

  const response = await fetch(
    'https://api.mercadopago.com' + path,
    {
      ...options,
      headers: {
        Authorization:
          `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type':
          'application/json'
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      'Mercado Pago:',
      data
    );

    throw new Error(
      data.message ||
      'Error de Mercado Pago'
    );
  }

  return data;
}

async function createPreference({
  title,
  amount,
  reference,
  name
}) {
  return mpRequest(
    '/checkout/preferences',
    {
      method: 'POST',
      body: JSON.stringify({
        items: [
          {
            title,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: Number(amount)
          }
        ],

        external_reference:
          reference,

        payer:
          name
            ? { name }
            : undefined,

        back_urls: {
          success:
            `${PUBLIC_URL}/?pay=success`,
          pending:
            `${PUBLIC_URL}/?pay=pending`,
          failure:
            `${PUBLIC_URL}/?pay=failure`
        },

        auto_return: 'approved',

        notification_url:
          `${PUBLIC_URL}/api/webhook`
      })
    }
  );
}

/* =====================================
   CONFIGURACIÓN PÚBLICA
===================================== */

app.get(
  '/api/config',
  async (_req, res) => {
    const [
      courses,
      products,
      background
    ] = await Promise.all([
      getCourses(),
      getProducts(),
      getBackground()
    ]);

    res.json({
      courses,
      products,
      background
    });
  }
);

/* =====================================
   OBTENER UNA INSCRIPCIÓN
===================================== */

app.get(
  '/api/signup/:id',
  async (req, res) => {
    try {
      const signup =
        await getSignupById(
          req.params.id
        );

      if (!signup) {
        return res
          .status(404)
          .json({
            error:
              'No se encontró la inscripción.'
          });
      }

      res.json(signup);

    } catch (error) {
      res
        .status(500)
        .json({
          error:
            'No se pudo obtener la inscripción.'
        });
    }
  }
);

/* =====================================
   NUEVA INSCRIPCIÓN
===================================== */

app.post(
  '/api/signup',
  async (req, res) => {
    try {
      const {
        name,
        lastname,
        documentNumber,
        birthDate,
        phone,
        courseId,
        schedule
      } = req.body;

      if (
        !name ||
        !lastname ||
        !documentNumber ||
        !birthDate ||
        !phone ||
        !courseId ||
        !schedule
      ) {
        return res
          .status(400)
          .json({
            error:
              'Completá todos los datos.'
          });
      }

      const courses =
        await getCourses();

      const course =
        courses.find(
          item =>
            item.id === courseId
        );

      if (!course) {
        return res
          .status(400)
          .json({
            error:
              'Curso inválido.'
          });
      }

      const signup = {
        id:
          'ins-' +
          Date.now() +
          '-' +
          Math.random()
            .toString(36)
            .slice(2, 7),

        name:
          String(name).trim(),

        lastname:
          String(lastname).trim(),

        document_number:
          String(documentNumber).trim(),

        birth_date:
          birthDate,

        phone:
          String(phone).trim(),

        course_id:
          courseId,

        course_name:
          course.name,

        schedule,

        amount:
          Number(course.inscription),

        status:
          'pending'
      };

      await createSignup(signup);

      const preference =
        await createPreference({
          title:
            `Inscripción ${course.name}`,

          amount:
            course.inscription,

          reference:
            signup.id,

          name:
            `${signup.name} ${signup.lastname}`
        });

      res.json({
        checkoutUrl:
          preference.init_point ||
          preference.sandbox_init_point,

        signup
      });

    } catch (error) {
      console.error(error);

      res
        .status(500)
        .json({
          error:
            error.message ||
            'No se pudo realizar la inscripción.'
        });
    }
  }
);

/* =====================================
   PEDIDOS
===================================== */

app.post(
  '/api/order',
  async (req, res) => {
    try {
      const products =
        await getProducts();

      let total = 0;

      for (
        const item of
        req.body.items || []
      ) {
        const product =
          products.find(
            product =>
              product.id ===
              item.productId
          );

        if (!product) {
          return res
            .status(400)
            .json({
              error:
                'Producto inválido.'
            });
        }

        total +=
          Number(product.price) *
          Number(item.qty || 1);
      }

      if (total <= 0) {
        return res
          .status(400)
          .json({
            error:
              'El carrito está vacío.'
          });
      }

      const order = {
        id:
          'ped-' +
          Date.now(),

        customer:
          req.body.customer,

        items:
          req.body.items,

        total,

        status:
          'pending'
      };

      orders.unshift(order);

      const preference =
        await createPreference({
          title:
            'Pedido Centro Constitución',

          amount:
            total,

          reference:
            order.id,

          name:
            order.customer?.name
        });

      res.json({
        checkoutUrl:
          preference.init_point ||
          preference.sandbox_init_point
      });

    } catch (error) {
      console.error(error);

      res
        .status(500)
        .json({
          error:
            error.message ||
            'No se pudo iniciar el pago.'
        });
    }
  }
);

/* =====================================
   WEBHOOK MERCADO PAGO
===================================== */

app.post(
  '/api/webhook',
  async (req, res) => {
    res.sendStatus(200);

    try {
      const paymentId =
        req.query['data.id'] ||
        req.body?.data?.id;

      if (!paymentId) {
        return;
      }

      const payment =
        await mpRequest(
          `/v1/payments/${paymentId}`
        );

      const reference =
        payment.external_reference;

      if (!reference) {
        return;
      }

      if (
        reference.startsWith('ins-')
      ) {
        await updateSignupPayment(
          reference,
          payment
        );

        return;
      }

      if (
        reference.startsWith('ped-')
      ) {
        const order =
          orders.find(
            item =>
              item.id === reference
          );

        if (order) {
          order.status =
            payment.status ===
            'approved'
              ? 'approved'
              : payment.status;
        }
      }

    } catch (error) {
      console.error(
        'Webhook:',
        error
      );
    }
  }
);

/* =====================================
   LOGIN ADMIN
===================================== */

function auth(
  req,
  res,
  next
) {
  try {
    const token =
      req.cookies.admin;

    if (!token) {
      return res
        .status(401)
        .end();
    }

    jwt.verify(
      token,
      JWT_SECRET
    );

    next();

  } catch {
    res
      .status(401)
      .end();
  }
}

app.post(
  '/api/login',
  (req, res) => {
    const email =
      process.env.ADMIN_EMAIL ||
      'admin@centroconstitucion.com';

    const password =
      process.env.ADMIN_PASSWORD ||
      'Cambiar123!';

    if (
      req.body.email !== email ||
      req.body.password !== password
    ) {
      return res
        .status(401)
        .json({
          error:
            'Datos incorrectos.'
        });
    }

    res.cookie(
      'admin',

      jwt.sign(
        { email },
        JWT_SECRET,
        {
          expiresIn:
            '12h'
        }
      ),

      {
        httpOnly: true,
        sameSite: 'lax',
        secure:
          PUBLIC_URL.startsWith(
            'https://'
          )
      }
    );

    res.json({
      ok: true
    });
  }
);

/* =====================================
   API PANEL ADMIN
===================================== */

app.get(
  '/api/admin',
  auth,
  async (_req, res) => {
    const [
      courses,
      products,
      signups,
      background
    ] =
      await Promise.all([
        getCourses(),
        getProducts(),
        getSignups(),
        getBackground()
      ]);

    res.json({
      courses,
      products,
      signups,
      orders,
      background
    });
  }
);

app.put(
  '/api/admin/courses',
  auth,
  async (req, res) => {
    try {
      await saveCourses(
        req.body.courses
      );

      res.json({
        ok: true
      });

    } catch (error) {
      res
        .status(500)
        .json({
          error:
            'No se pudieron guardar los cursos.'
        });
    }
  }
);

app.put(
  '/api/admin/products',
  auth,
  async (req, res) => {
    try {
      await saveProducts(
        req.body.products
      );

      res.json({
        ok: true
      });

    } catch (error) {
      console.error(error);

      res
        .status(500)
        .json({
          error:
            'No se pudieron guardar los productos.'
        });
    }
  }
);

/* =====================================
   GUARDAR FONDO
===================================== */

app.put(
  '/api/admin/background',
  auth,
  async (req, res) => {
    try {
      const value =
        String(
          req.body.background || ''
        );

      if (
        value &&
        !value.startsWith('data:image/') &&
        !value.startsWith('https://') &&
        !value.startsWith('http://')
      ) {
        return res
          .status(400)
          .json({
            error:
              'La imagen no es válida.'
          });
      }

      await saveBackground(
        value
      );

      res.json({
        ok: true
      });

    } catch (error) {
      console.error(error);

      res
        .status(500)
        .json({
          error:
            'No se pudo guardar el fondo.'
        });
    }
  }
);

/* =====================================
   CSS
===================================== */

const css = `
*{
box-sizing:border-box
}

html{
scroll-behavior:smooth
}

body{
margin:0;
font-family:Arial,sans-serif;
background:#f7f3ee;
color:#181818;
background-size:cover;
background-position:center;
background-repeat:no-repeat;
background-attachment:fixed
}

a{
text-decoration:none;
color:inherit
}

.c{
width:min(1120px,calc(100% - 30px));
margin:auto
}

header{
position:sticky;
top:0;
background:rgba(247,243,238,.94);
backdrop-filter:blur(10px);
border-bottom:1px solid #e5ddd4;
z-index:5
}

.nav{
height:72px;
display:flex;
align-items:center;
justify-content:space-between
}

.logo{
width:42px;
height:42px;
border-radius:50%;
object-fit:cover;
margin-right:8px;
vertical-align:middle;
background:#fff
}

.hero{
padding:70px 0
}

.heroGrid{
display:grid;
grid-template-columns:1.1fr .9fr;
gap:40px;
align-items:center
}

h1{
font-family:Georgia,serif;
font-size:clamp(48px,7vw,86px);
line-height:.95;
margin:10px 0
}

h2{
font-family:Georgia,serif;
font-size:42px
}

.muted{
color:#716c66
}

.heroText{
background:rgba(247,243,238,.82);
padding:25px;
border-radius:28px;
backdrop-filter:blur(5px)
}

.heroCard{
height:430px;
border-radius:32px;
background:linear-gradient(145deg,#111,#342b23);
color:#fff;
padding:28px;
display:flex;
flex-direction:column;
justify-content:space-between
}

.heroCard b{
font-family:Georgia,serif;
font-size:46px
}

.sec{
padding:80px 0
}

.soft{
background:rgba(239,231,221,.88);
backdrop-filter:blur(4px)
}

.grid2{
display:grid;
grid-template-columns:1fr 1fr;
gap:18px
}

.grid3{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:18px
}

.card{
background:rgba(255,255,255,.94);
border:1px solid #e5ddd4;
border-radius:24px;
padding:22px
}

.tag{
display:inline-block;
background:#f2ece5;
border-radius:999px;
padding:7px 10px;
font-size:12px;
margin:4px
}

.btn{
border:0;
border-radius:999px;
padding:13px 18px;
font-weight:800;
cursor:pointer;
display:inline-block
}

.pri{
background:#171717;
color:#fff
}

.secbtn{
background:#fff;
border:1px solid #ddd
}

.green{
background:#168342;
color:#fff
}

.form{
background:rgba(255,255,255,.96);
padding:24px;
border-radius:24px
}

.field{
margin-bottom:12px
}

.field label{
display:block;
font-size:13px;
font-weight:800;
margin-bottom:6px
}

input,
select,
textarea{
width:100%;
padding:13px;
border:1px solid #ddd;
border-radius:12px;
background:#fff
}

.signup{
display:grid;
grid-template-columns:.85fr 1.15fr;
gap:40px
}

.product{
background:rgba(255,255,255,.96);
border-radius:22px;
overflow:hidden;
border:1px solid #ddd
}

.pic{
height:180px;
background:#e8ddd1;
display:grid;
place-items:center;
font-size:58px;
overflow:hidden
}

.pic img{
width:100%;
height:100%;
object-fit:cover;
display:block
}

.preview{
width:100%;
height:220px;
border-radius:16px;
object-fit:cover;
background:#eee;
margin:10px 0
}

.backgroundPreview{
width:100%;
height:260px;
border-radius:20px;
object-fit:cover;
background:#eee;
margin:15px 0
}

.pb{
padding:18px
}

.drawer{
position:fixed;
inset:0;
background:#0008;
display:none;
justify-content:flex-end;
z-index:10
}

.drawer.open{
display:flex
}

.panel{
width:min(430px,100%);
height:100%;
background:#fff;
padding:22px;
overflow:auto
}

.row{
padding:16px 0;
border-bottom:1px solid #ddd
}

.admin{
display:grid;
grid-template-columns:1fr 1fr;
gap:18px
}

.login{
min-height:100vh;
display:grid;
place-items:center
}

.loginBox{
width:min(420px,calc(100% - 30px));
background:#fff;
padding:28px;
border-radius:24px
}

.status{
display:inline-block;
padding:6px 10px;
border-radius:20px;
font-size:12px;
font-weight:bold;
margin-top:7px
}

.approved{
background:#ddf5e5;
color:#176b34
}

.pending{
background:#fff1c9;
color:#745900
}

.student{
background:#faf8f5;
border:1px solid #e8e1da;
border-radius:18px;
padding:16px;
margin-bottom:12px
}

.student h3{
margin:0 0 10px
}

.student p{
margin:5px 0
}

.paymentBox{
display:none;
position:fixed;
inset:0;
background:rgba(0,0,0,.72);
z-index:50;
align-items:center;
justify-content:center;
padding:20px
}

.paymentBox.open{
display:flex
}

.paymentCard{
width:min(500px,100%);
background:#fff;
border-radius:28px;
padding:28px;
text-align:center
}

.paymentIcon{
font-size:60px
}

@media(max-width:800px){

.heroGrid,
.grid2,
.grid3,
.signup,
.admin{
grid-template-columns:1fr
}

.heroCard{
height:320px
}

h2{
font-size:34px
}

.sec{
padding:50px 0
}

body{
background-attachment:scroll
}

}
`;

/* =====================================
   HOME
===================================== */

const home = `
<!doctype html>

<html lang="es">

<head>

<meta charset="utf-8">

<meta
name="viewport"
content="width=device-width,initial-scale=1"
>

<title>
Centro Constitución
</title>

<style>
${css}
</style>

</head>

<body>

<header>

<div class="c nav">

<div>

<img
class="logo"
src="/IMG_5279.jpeg"
>

<b>
Centro Constitución
</b>

</div>

<a href="/admin">
Panel
</a>

</div>

</header>

<section class="hero">

<div class="c heroGrid">

<div class="heroText">

<small>
FORMACIÓN • BELLEZA • PROFESIÓN
</small>

<h1>
Transformá tu talento en una profesión.
</h1>

<p class="muted">
Cursos presenciales en Constitución y herramientas profesionales.
</p>

<a
class="btn pri"
href="#inscripcion"
>
Inscribirme ahora
</a>

</div>

<div class="heroCard">

<small>
CENTRO CONSTITUCIÓN
</small>

<b>
Tu próximo paso empieza acá.
</b>

<small>
Av. Brasil 1223 · Constitución
</small>

</div>

</div>

</section>

<section class="sec">

<div class="c">

<h2>
Cursos
</h2>

<div
id="courses"
class="grid2"
></div>

</div>

</section>

<section
class="sec soft"
id="inscripcion"
>

<div class="c signup">

<div>

<h2>
Inscripción online
</h2>

<p>
Completá tus datos, elegí tu curso y horario y aboná la inscripción.
</p>

</div>

<form
id="signup"
class="form"
>

<div class="field">

<label>
Nombre
</label>

<input
name="name"
required
>

</div>

<div class="field">

<label>
Apellido
</label>

<input
name="lastname"
required
>

</div>

<div class="field">

<label>
Número de documento
</label>

<input
name="documentNumber"
required
inputmode="numeric"
>

</div>

<div class="field">

<label>
Fecha de nacimiento
</label>

<input
name="birthDate"
type="date"
required
>

</div>

<div class="field">

<label>
WhatsApp
</label>

<input
name="phone"
required
inputmode="tel"
placeholder="Ej: 11 1234 5678"
>

</div>

<div class="field">

<label>
Curso
</label>

<select
id="course"
name="courseId"
required
></select>

</div>

<div class="field">

<label>
Horario
</label>

<select
id="schedule"
name="schedule"
required
></select>

</div>

<button
class="btn pri"
style="width:100%"
>

Inscribirme y pagar

</button>

<p id="msg"></p>

</form>

</div>

</section>

<section class="sec">

<div class="c">

<div
style="
display:flex;
justify-content:space-between;
align-items:center
"
>

<h2>
Tienda
</h2>

<button
class="btn secbtn"
id="cartBtn"
>

🛒 Carrito

<span id="count">
0
</span>

</button>

</div>

<div
id="products"
class="grid3"
></div>

</div>

</section>

<section
class="sec"
style="
background:#171717;
color:#fff
"
>

<div class="c">

<h2>
Av. Brasil 1223
</h2>

<p>
Constitución, CABA
</p>

<a
class="btn secbtn"
target="_blank"
href="https://wa.me/${BUSINESS_WHATSAPP}"
>

WhatsApp

</a>

</div>

</section>

<div
id="drawer"
class="drawer"
>

<div class="panel">

<button
id="close"
class="btn secbtn"
>
Cerrar
</button>

<h2>
Carrito
</h2>

<div id="items"></div>

<h3 id="total">
$0
</h3>

<form id="order">

<div class="field">

<label>
Nombre
</label>

<input
name="name"
required
>

</div>

<div class="field">

<label>
WhatsApp
</label>

<input
name="phone"
required
>

</div>

<button
class="btn pri"
style="width:100%"
>
Comprar con Mercado Pago
</button>

<p id="omsg"></p>

</form>

</div>

</div>

<div
id="paymentBox"
class="paymentBox"
>

<div class="paymentCard">

<div class="paymentIcon">
✅
</div>

<h2>
¡Pago realizado!
</h2>

<p>
Tu inscripción fue registrada correctamente.
</p>

<p>
Ahora tocá el botón para enviar los datos de la inscripción a Centro Constitución.
</p>

<a
id="sendWhatsApp"
class="btn green"
target="_blank"
style="
width:100%;
font-size:17px
"
>

💬 Enviar inscripción por WhatsApp

</a>

<br><br>

<button
id="closePayment"
class="btn secbtn"
>

Cerrar

</button>

</div>

</div>

<script>

let cfg;
let cart = [];

const $ =
selector =>
document.querySelector(selector);

const money =
number =>
new Intl.NumberFormat(
'es-AR',
{
style:'currency',
currency:'ARS',
maximumFractionDigits:0
}
).format(number);

async function api(
url,
options = {}
){

const response =
await fetch(
url,
{
headers:{
'Content-Type':
'application/json'
},
...options
}
);

const data =
await response
.json()
.catch(()=>({}));

if(!response.ok){

throw new Error(
data.error ||
data.message ||
'Error'
);

}

return data;

}

function applyBackground(value){

if(!value){
document.body.style.backgroundImage =
'none';
return;
}

document.body.style.backgroundImage =
'linear-gradient(rgba(247,243,238,.80),rgba(247,243,238,.80)),url("' +
value +
'")';

}

function productPicture(product){

const value =
product.emoji ||
'🛍️';

if(
value.startsWith('data:image/') ||
value.startsWith('https://') ||
value.startsWith('http://')
){

return (
'<img src="' +
value +
'" alt="' +
product.name +
'">'
);

}

return value;

}

async function init(){

cfg =
await api('/api/config');

applyBackground(
cfg.background
);

$('#courses').innerHTML =
cfg.courses
.map(course =>

'<div class="card">' +

'<div style="font-size:30px">' +
course.icon +
'</div>' +

'<h3>' +
course.name +
'</h3>' +

'<p class="muted">' +
course.description +
'</p>' +

'<div>' +

course.schedules
.map(
schedule =>
'<span class="tag">' +
schedule +
'</span>'
)
.join('') +

'</div>' +

'<p><b>Inscripción ' +
money(course.inscription) +
'</b> · Cuota ' +
money(course.monthly) +
'</p>' +

'<button class="btn pri" onclick="choose(\\'' +
course.id +
'\\')">Inscribirme</button>' +

'</div>'

)
.join('');

$('#products').innerHTML =
cfg.products
.map(product =>

'<div class="product">' +

'<div class="pic">' +
productPicture(product) +
'</div>' +

'<div class="pb">' +

'<h3>' +
product.name +
'</h3>' +

'<b>' +
money(product.price) +
'</b>' +

'<p class="muted">Stock: ' +
product.stock +
'</p>' +

'<button class="btn pri" onclick="add(\\'' +
product.id +
'\\')">Agregar</button>' +

'</div>' +

'</div>'

)
.join('');

$('#course').innerHTML =
cfg.courses
.map(course =>

'<option value="' +
course.id +
'">' +
course.name +
'</option>'

)
.join('');

updateSchedules();

await checkPaymentReturn();

}

function updateSchedules(){

const course =
cfg.courses.find(
item =>
item.id ===
$('#course').value
);

if(!course){
return;
}

$('#schedule').innerHTML =
course.schedules
.map(
schedule =>
'<option>' +
schedule +
'</option>'
)
.join('');

}

window.choose =
id => {

$('#course').value =
id;

updateSchedules();

location.hash =
'inscripcion';

};

$('#course').onchange =
updateSchedules;

window.add =
id => {

const product =
cfg.products.find(
item =>
item.id === id
);

if(!product){
return;
}

const item =
cart.find(
item =>
item.productId === id
);

if(item){

item.qty++;

}else{

cart.push({
productId:id,
name:product.name,
price:Number(product.price),
qty:1
});

}

renderCart();

};

function renderCart(){

$('#count').textContent =
cart.reduce(
(total,item) =>
total + item.qty,
0
);

$('#items').innerHTML =
cart
.map(
item =>

'<div class="row">' +
item.name +
' × ' +
item.qty +
' — ' +
money(
item.price *
item.qty
) +
'</div>'

)
.join('') ||

'<p>Carrito vacío</p>';

$('#total').textContent =
money(
cart.reduce(
(total,item) =>
total +
item.price *
item.qty,
0
)
);

}

$('#cartBtn').onclick =
() => {

$('#drawer')
.classList
.add('open');

};

$('#close').onclick =
() => {

$('#drawer')
.classList
.remove('open');

};

$('#closePayment').onclick =
() => {

$('#paymentBox')
.classList
.remove('open');

history.replaceState(
{},
'',
'/'
);

};

function formatDate(value){

if(!value){
return '';
}

const date =
String(value)
.split('T')[0];

const parts =
date.split('-');

if(parts.length !== 3){
return date;
}

return (
parts[2] +
'/' +
parts[1] +
'/' +
parts[0]
);

}

async function checkPaymentReturn(){

const params =
new URLSearchParams(
location.search
);

const pay =
params.get('pay');

const paymentStatus =
params.get('status') ||
params.get('collection_status');

if(
pay !== 'success' &&
paymentStatus !== 'approved'
){
return;
}

let reference =
params.get(
'external_reference'
);

if(!reference){

const stored =
localStorage.getItem(
'pendingSignup'
);

if(stored){

try{

const parsed =
JSON.parse(stored);

reference =
parsed.id || '';

}catch{}

}

}

if(!reference){
return;
}

try{

const signup =
await api(
'/api/signup/' +
encodeURIComponent(
reference
)
);

const message =

'✅ NUEVA INSCRIPCIÓN PAGADA\\n\\n' +

'Nombre: ' +
(signup.name || '') +
'\\n' +

'Apellido: ' +
(signup.lastname || '') +
'\\n' +

'Número de documento: ' +
(signup.document_number || '') +
'\\n' +

'Fecha de nacimiento: ' +
formatDate(
signup.birth_date
) +
'\\n' +

'WhatsApp: ' +
(signup.phone || '') +
'\\n' +

'Curso: ' +
(signup.course_name || '') +
'\\n' +

'Horario: ' +
(signup.schedule || '') +
'\\n\\n' +

'Pago realizado por Mercado Pago.';

$('#sendWhatsApp').href =
'https://wa.me/${BUSINESS_WHATSAPP}?text=' +
encodeURIComponent(
message
);

$('#paymentBox')
.classList
.add('open');

localStorage.removeItem(
'pendingSignup'
);

}catch(error){

console.error(
error
);

}

}

$('#signup').onsubmit =
async event => {

event.preventDefault();

$('#msg').textContent =
'Procesando...';

try{

const formData =
Object.fromEntries(
new FormData(
event.target
)
);

const response =
await api(
'/api/signup',
{
method:'POST',
body:
JSON.stringify(
formData
)
}
);

localStorage.setItem(
'pendingSignup',
JSON.stringify({
id:
response.signup.id
})
);

if(
response.checkoutUrl
){

location.href =
response.checkoutUrl;

}else{

$('#msg').textContent =
'No se pudo abrir Mercado Pago.';

}

}catch(error){

$('#msg').textContent =
error.message;

}

};

$('#order').onsubmit =
async event => {

event.preventDefault();

if(!cart.length){

$('#omsg').textContent =
'Agregá un producto primero.';

return;

}

try{

const customer =
Object.fromEntries(
new FormData(
event.target
)
);

const response =
await api(
'/api/order',
{
method:'POST',
body:
JSON.stringify({
customer,
items:
cart.map(
item => ({
productId:
item.productId,
qty:
item.qty
})
)
})
}
);

if(
response.checkoutUrl
){

location.href =
response.checkoutUrl;

}

}catch(error){

$('#omsg').textContent =
error.message;

}

};

init();

renderCart();

</script>

</body>

</html>
`;

/* =====================================
   LOGIN
===================================== */

const login = `
<!doctype html>

<html lang="es">

<head>

<meta
name="viewport"
content="width=device-width,initial-scale=1"
>

<style>
${css}
</style>

</head>

<body>

<div class="login">

<form
id="loginForm"
class="loginBox"
>

<img
class="logo"
src="/IMG_5279.jpeg"
>

<h2>
Panel
</h2>

<div class="field">

<label>
Email
</label>

<input
name="email"
type="email"
required
>

</div>

<div class="field">

<label>
Contraseña
</label>

<input
name="password"
type="password"
required
>

</div>

<button
class="btn pri"
style="width:100%"
>

Ingresar

</button>

<p id="loginMessage"></p>

</form>

</div>

<script>

document
.getElementById(
'loginForm'
)
.onsubmit =
async event => {

event.preventDefault();

const response =
await fetch(
'/api/login',
{
method:'POST',

headers:{
'Content-Type':
'application/json'
},

body:
JSON.stringify(
Object.fromEntries(
new FormData(
event.target
)
)
)
}
);

if(response.ok){

location.href =
'/admin';

}else{

document
.getElementById(
'loginMessage'
)
.textContent =
'Datos incorrectos';

}

};

</script>

</body>

</html>
`;

/* =====================================
   PANEL ADMIN
===================================== */

const admin = `
<!doctype html>

<html lang="es">

<head>

<meta
name="viewport"
content="width=device-width,initial-scale=1"
>

<style>
${css}
</style>

</head>

<body>

<header>

<div class="c nav">

<b>

<img
class="logo"
src="/IMG_5279.jpeg"
>

Administración

</b>

<a href="/">
Ver web
</a>

</div>

</header>

<section class="sec">

<div class="c">

<div class="card">

<h2>
Fondo del sitio
</h2>

<p class="muted">
Elegí una imagen de tu celular. La vas a poder cambiar cuando quieras.
</p>

<div id="backgroundPreview"></div>

<input
id="backgroundFile"
type="file"
accept="image/*"
>

<br><br>

<button
class="btn pri"
onclick="saveSiteBackground()"
>

Guardar fondo

</button>

<button
class="btn secbtn"
onclick="removeSiteBackground()"
>

Quitar fondo

</button>

</div>

<br>

<div class="card">

<h2>
Alumnos inscriptos
</h2>

<p class="muted">
Las inscripciones quedan guardadas acá.
</p>

<div id="students"></div>

</div>

<br>

<div class="admin">

<div class="card">

<h2>
Cursos
</h2>

<div id="coursesAdmin"></div>

<button
class="btn pri"
onclick="addCourse()"
>
+ Curso
</button>

</div>

<div class="card">

<h2>
Productos
</h2>

<div id="productsAdmin"></div>

<button
class="btn pri"
onclick="addProduct()"
>
+ Producto
</button>

</div>

</div>

</div>

</section>

<script>

let db;
let selectedBackground = '';

async function api(
url,
options = {}
){

const response =
await fetch(
url,
{
headers:{
'Content-Type':
'application/json'
},
...options
}
);

if(
response.status === 401
){

location.href =
'/login';

throw new Error(
'No autorizado'
);

}

const data =
await response
.json()
.catch(()=>({}));

if(!response.ok){

throw new Error(
data.error ||
data.message ||
'Error'
);

}

return data;

}

async function load(){

db =
await api(
'/api/admin'
);

selectedBackground =
db.background || '';

render();

}

function safe(value){

return String(
value || ''
)
.replaceAll('&','&amp;')
.replaceAll('<','&lt;')
.replaceAll('>','&gt;')
.replaceAll('"','&quot;');

}

function formatBirthDate(value){

if(!value){
return '-';
}

const date =
String(value)
.split('T')[0];

const parts =
date.split('-');

if(parts.length !== 3){
return date;
}

return (
parts[2] +
'/' +
parts[1] +
'/' +
parts[0]
);

}

function whatsappNumber(value){

let number =
String(
value || ''
)
.replace(
/\\D/g,
''
);

if(
number.startsWith('549')
){
return number;
}

if(
number.startsWith('54')
){

number =
number.slice(2);

}

if(
number.startsWith('0')
){

number =
number.slice(1);

}

if(
number.startsWith('15')
){

number =
number.slice(2);

}

return (
'549' +
number
);

}

function productPreview(product){

const value =
product.emoji ||
'';

if(
value.startsWith('data:image/') ||
value.startsWith('https://') ||
value.startsWith('http://')
){

return (
'<img class="preview" src="' +
value +
'">'
);

}

return (
'<div style="font-size:55px;text-align:center;padding:20px">' +
(value || '🛍️') +
'</div>'
);

}

function renderBackground(){

const preview =
document.getElementById(
'backgroundPreview'
);

if(
selectedBackground
){

preview.innerHTML =
'<img class="backgroundPreview" src="' +
selectedBackground +
'">';

}else{

preview.innerHTML =
'<div class="backgroundPreview" style="display:grid;place-items:center">Sin imagen de fondo</div>';

}

}

function render(){

renderBackground();

students.innerHTML =
db.signups.length
? db.signups
.map(
signup => {

const approved =
signup.status ===
'approved';

const phone =
whatsappNumber(
signup.phone
);

const whatsappText =
encodeURIComponent(
'Hola ' +
signup.name +
', te hablamos de Centro Constitución.'
);

return (

'<div class="student">' +

'<h3>' +
safe(signup.name) +
' ' +
safe(signup.lastname) +
'</h3>' +

'<p><b>Documento:</b> ' +
safe(
signup.document_number
) +
'</p>' +

'<p><b>Fecha de nacimiento:</b> ' +
safe(
formatBirthDate(
signup.birth_date
)
) +
'</p>' +

'<p><b>WhatsApp:</b> ' +
safe(
signup.phone
) +
'</p>' +

'<p><b>Curso:</b> ' +
safe(
signup.course_name
) +
'</p>' +

'<p><b>Horario:</b> ' +
safe(
signup.schedule
) +
'</p>' +

'<p><b>Inscripción:</b> $' +
Number(
signup.amount || 0
)
.toLocaleString(
'es-AR'
) +
'</p>' +

'<span class="status ' +
(approved
? 'approved'
: 'pending') +
'">' +

(approved
? '✅ Pago aprobado'
: '⏳ ' +
safe(
signup.status ||
'Pendiente'
)) +

'</span>' +

'<br><br>' +

'<a class="btn green" target="_blank" href="https://wa.me/' +
phone +
'?text=' +
whatsappText +
'">' +

'💬 Hablar por WhatsApp' +

'</a>' +

'</div>'

);

}
)
.join('')
:
'<p>No hay inscripciones todavía.</p>';

coursesAdmin.innerHTML =
db.courses
.map(
(course,index) =>

'<div class="row">' +

'<label>Nombre</label>' +

'<input value="' +
safe(course.name) +
'" onchange="db.courses[' +
index +
'].name=this.value">' +

'<label>Descripción</label>' +

'<textarea onchange="db.courses[' +
index +
'].description=this.value">' +
safe(course.description) +
'</textarea>' +

'<label>Horarios separados con |</label>' +

'<input value="' +
safe(
course.schedules.join(
' | '
)
) +
'" onchange="db.courses[' +
index +
'].schedules=this.value.split(\\'|\\').map(x=>x.trim())">' +

'<label>Inscripción</label>' +

'<input type="number" value="' +
course.inscription +
'" onchange="db.courses[' +
index +
'].inscription=+this.value">' +

'<label>Cuota</label>' +

'<input type="number" value="' +
course.monthly +
'" onchange="db.courses[' +
index +
'].monthly=+this.value">' +

'<br><br>' +

'<button class="btn secbtn" onclick="saveCourses()">Guardar curso</button>' +

'</div>'

)
.join('');

productsAdmin.innerHTML =
db.products
.map(
(product,index) =>

'<div class="row">' +

'<label>Producto</label>' +

'<input value="' +
safe(product.name) +
'" onchange="db.products[' +
index +
'].name=this.value">' +

'<label>Foto</label>' +

productPreview(
product
) +

'<input type="file" accept="image/*" onchange="changePhoto(event,' +
index +
')">' +

'<label>Precio</label>' +

'<input type="number" value="' +
product.price +
'" onchange="db.products[' +
index +
'].price=+this.value">' +

'<label>Stock</label>' +

'<input type="number" value="' +
product.stock +
'" onchange="db.products[' +
index +
'].stock=+this.value">' +

'<br><br>' +

'<button class="btn secbtn" onclick="saveProducts()">Guardar producto</button>' +

'</div>'

)
.join('');

}

/* =====================================
   CAMBIAR FONDO
===================================== */

document
.getElementById(
'backgroundFile'
)
.addEventListener(
'change',
event => {

const file =
event.target.files?.[0];

if(!file){
return;
}

if(
!file.type.startsWith(
'image/'
)
){

alert(
'Elegí una imagen válida.'
);

return;

}

const reader =
new FileReader();

reader.onload =
() => {

const image =
new Image();

image.onload =
() => {

const maxWidth =
1400;

let width =
image.width;

let height =
image.height;

if(
width > maxWidth
){

height =
Math.round(
height *
maxWidth /
width
);

width =
maxWidth;

}

const canvas =
document.createElement(
'canvas'
);

canvas.width =
width;

canvas.height =
height;

const context =
canvas.getContext(
'2d'
);

context.drawImage(
image,
0,
0,
width,
height
);

selectedBackground =
canvas.toDataURL(
'image/jpeg',
0.68
);

renderBackground();

};

image.src =
reader.result;

};

reader.readAsDataURL(
file
);

}
);

window.saveSiteBackground =
async () => {

if(
!selectedBackground
){

alert(
'Elegí una imagen primero.'
);

return;

}

try{

await api(
'/api/admin/background',
{
method:'PUT',
body:
JSON.stringify({
background:
selectedBackground
})
}
);

db.background =
selectedBackground;

alert(
'✅ Fondo guardado correctamente.'
);

}catch(error){

alert(
error.message
);

}

};

window.removeSiteBackground =
async () => {

try{

await api(
'/api/admin/background',
{
method:'PUT',
body:
JSON.stringify({
background:''
})
}
);

selectedBackground =
'';

db.background =
'';

renderBackground();

document.getElementById(
'backgroundFile'
).value =
'';

alert(
'Fondo eliminado.'
);

}catch(error){

alert(
error.message
);

}

};

/* =====================================
   FOTO PRODUCTOS
===================================== */

window.changePhoto =
(event,index) => {

const file =
event.target.files?.[0];

if(!file){
return;
}

if(
!file.type.startsWith(
'image/'
)
){
return;
}

const reader =
new FileReader();

reader.onload =
() => {

const image =
new Image();

image.onload =
() => {

const max =
850;

let width =
image.width;

let height =
image.height;

if(
width > height &&
width > max
){

height =
Math.round(
height *
max /
width
);

width =
max;

}else if(
height > max
){

width =
Math.round(
width *
max /
height
);

height =
max;

}

const canvas =
document.createElement(
'canvas'
);

canvas.width =
width;

canvas.height =
height;

canvas
.getContext('2d')
.drawImage(
image,
0,
0,
width,
height
);

db.products[
index
].emoji =
canvas.toDataURL(
'image/jpeg',
0.7
);

render();

};

image.src =
reader.result;

};

reader.readAsDataURL(
file
);

};

/* =====================================
   GUARDAR CURSOS / PRODUCTOS
===================================== */

window.saveCourses =
async () => {

try{

await api(
'/api/admin/courses',
{
method:'PUT',
body:
JSON.stringify({
courses:
db.courses
})
}
);

alert(
'Cursos guardados.'
);

await load();

}catch(error){

alert(
error.message
);

}

};

window.saveProducts =
async () => {

try{

await api(
'/api/admin/products',
{
method:'PUT',
body:
JSON.stringify({
products:
db.products
})
}
);

alert(
'Productos guardados.'
);

await load();

}catch(error){

alert(
error.message
);

}

};

window.addCourse =
() => {

db.courses.push({
id:
'c' +
Date.now(),

icon:
'🎓',

name:
'Nuevo curso',

description:
'Descripción',

schedules:[
'Horario próximamente'
],

inscription:
20000,

monthly:
80000
});

render();

};

window.addProduct =
() => {

db.products.push({
id:
'p' +
Date.now(),

emoji:
'🛍️',

name:
'Nuevo producto',

price:
0,

stock:
0
});

render();

};

load();

</script>

</body>

</html>
`;

/* =====================================
   RUTAS
===================================== */

app.get(
  '/',
  (_req, res) => {
    res
      .type('html')
      .send(home);
  }
);

app.get(
  '/login',
  (_req, res) => {
    res
      .type('html')
      .send(login);
  }
);

app.get(
  '/admin',
  (req, res) => {
    try {
      const token =
        req.cookies.admin;

      if (!token) {
        return res.redirect(
          '/login'
        );
      }

      jwt.verify(
        token,
        JWT_SECRET
      );

      res
        .type('html')
        .send(admin);

    } catch {
      res.redirect(
        '/login'
      );
    }
  }
);

/* =====================================
   INICIAR
===================================== */

app.listen(
  PORT,
  () => {
    console.log(
      `Centro Constitución funcionando en puerto ${PORT}`
    );
  }
);
