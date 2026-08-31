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
    schedules: [
      'Horario próximamente'
    ],
    inscription: 20000,
    monthly: 80000
  },
  {
    id: 'manicuria',
    icon: '💅',
    name: 'Manicuría y Pedicuría',
    description:
      'Manicuría, pedicuría y esmaltado tradicional y semipermanente.',
    schedules: [
      'Horario próximamente'
    ],
    inscription: 20000,
    monthly: 80000
  }
];

/* =====================================
   INFORMACIÓN COMPLETA DE LOS CURSOS
===================================== */

const defaultCourseDetails = {
  barberia: {
    image: '',
    duration: '4 meses',
    longDescription:
      'Curso pensado para quienes quieren aprender barbería desde cero y desarrollar una base sólida para trabajar profesionalmente.',
    syllabus: [
      'Uso correcto de máquina, tijera y navaja',
      'Cortes clásicos y modernos',
      'Degradados y fades',
      'Perfilado y terminaciones',
      'Prácticas con modelos reales'
    ]
  },

  peluqueria: {
    image: '',
    duration: '4 meses',
    longDescription:
      'Formación integral para aprender técnicas fundamentales de peluquería y desarrollar práctica profesional.',
    syllabus: [
      'Corte',
      'Brushing',
      'Peinados',
      'Tratamientos capilares',
      'Prácticas con modelos reales'
    ]
  },

  colorimetria: {
    image: '',
    duration: '4 meses',
    longDescription:
      'Curso enfocado en diagnóstico, teoría del color y técnicas profesionales de coloración.',
    syllabus: [
      'Teoría del color',
      'Diagnóstico capilar',
      'Alturas de tono y reflejos',
      'Neutralización',
      'Mezclas y formulación'
    ]
  },

  manicuria: {
    image: '',
    duration: 'A confirmar',
    longDescription:
      'Capacitación para aprender técnicas de manicuría y pedicuría con práctica y enfoque profesional.',
    syllabus: [
      'Preparación de uñas',
      'Manicuría',
      'Pedicuría',
      'Esmaltado tradicional',
      'Esmaltado semipermanente'
    ]
  }
};

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
    Authorization:
      `Bearer ${SUPABASE_SECRET_KEY}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

async function supabaseRequest(
  path,
  options = {}
) {
  if (
    !SUPABASE_URL ||
    !SUPABASE_SECRET_KEY
  ) {
    throw new Error(
      'Supabase no está configurado.'
    );
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
    console.error(
      'Supabase error:',
      data
    );

    throw new Error(
      data?.message ||
      data?.error ||
      'Error de Supabase'
    );
  }

  return data;
}

/* =====================================
   CONFIGURACIONES GUARDADAS
===================================== */

async function getSetting(key) {
  try {
    const data =
      await supabaseRequest(
        `site_settings?key=eq.${encodeURIComponent(key)}&select=value`
      );

    if (
      Array.isArray(data) &&
      data.length
    ) {
      return data[0].value || '';
    }

    return '';

  } catch (error) {
    console.error(
      'Error cargando configuración:',
      error.message
    );

    return '';
  }
}

async function saveSetting(
  key,
  value
) {
  return supabaseRequest(
    'site_settings?on_conflict=key',
    {
      method: 'POST',

      headers: {
        Prefer:
          'resolution=merge-duplicates,return=representation'
      },

      body: JSON.stringify({
        key,
        value: value || '',
        updated_at:
          new Date().toISOString()
      })
    }
  );
}

/* =====================================
   CURSOS
===================================== */

async function getCourses() {
  try {
    const data =
      await supabaseRequest(
        'courses?select=*&order=name.asc'
      );

    if (
      Array.isArray(data) &&
      data.length
    ) {
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

      body:
        JSON.stringify(courses)
    }
  );
}

/* =====================================
   DETALLES DE LOS CURSOS
===================================== */

async function getCourseDetails() {
  const raw =
    await getSetting(
      'course_details'
    );

  if (!raw) {
    return defaultCourseDetails;
  }

  try {
    const parsed =
      JSON.parse(raw);

    return {
      ...defaultCourseDetails,
      ...parsed
    };

  } catch {
    return defaultCourseDetails;
  }
}

async function saveCourseDetails(
  details
) {
  return saveSetting(
    'course_details',
    JSON.stringify(
      details || {}
    )
  );
}

/* =====================================
   PRODUCTOS
===================================== */

async function getProducts() {
  try {
    const data =
      await supabaseRequest(
        'products?select=*&order=name.asc'
      );

    if (
      Array.isArray(data) &&
      data.length
    ) {
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

      body:
        JSON.stringify(products)
    }
  );
}

/* =====================================
   FONDO
===================================== */

async function getBackground() {
  return getSetting(
    'background_image'
  );
}

async function saveBackground(value) {
  return saveSetting(
    'background_image',
    value || ''
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

async function mpRequest(
  path,
  options = {}
) {
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

  const data =
    await response.json();

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
            unit_price:
              Number(amount)
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

        auto_return:
          'approved',

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
      background,
      courseDetails
    ] =
      await Promise.all([
        getCourses(),
        getProducts(),
        getBackground(),
        getCourseDetails()
      ]);

    res.json({
      courses,
      products,
      background,
      courseDetails
    });
  }
);

/* =====================================
   OBTENER INSCRIPCIÓN
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
          Number(
            course.inscription
          ),

        status:
          'pending'
      };

      await createSignup(
        signup
      );

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
   PEDIDOS DE LA TIENDA
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
          Number(
            item.qty || 1
          );
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

      orders.unshift(
        order
      );

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
        reference.startsWith(
          'ins-'
        )
      ) {

        await updateSignupPayment(
          reference,
          payment
        );

        return;
      }

      if (
        reference.startsWith(
          'ped-'
        )
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
          expiresIn: '12h'
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
      background,
      courseDetails
    ] =
      await Promise.all([
        getCourses(),
        getProducts(),
        getSignups(),
        getBackground(),
        getCourseDetails()
      ]);

    res.json({
      courses,
      products,
      signups,
      orders,
      background,
      courseDetails
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

      console.error(error);

      res
        .status(500)
        .json({
          error:
            'No se pudieron guardar los cursos.'
        });
    }
  }
);

/* =====================================
   GUARDAR DETALLES DE CURSOS
===================================== */

app.put(
  '/api/admin/course-details',
  auth,
  async (req, res) => {

    try {

      await saveCourseDetails(
        req.body.courseDetails ||
        {}
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
            'No se pudo guardar la información de los cursos.'
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
          req.body.background ||
          ''
        );

      if (
        value &&
        !value.startsWith(
          'data:image/'
        ) &&
        !value.startsWith(
          'https://'
        ) &&
        !value.startsWith(
          'http://'
        )
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

/* CURSOS */

.courseCard{
cursor:pointer;
transition:.2s ease
}

.courseCard:hover{
transform:translateY(-3px);
box-shadow:0 12px 30px rgba(0,0,0,.08)
}

.courseThumb{
height:210px;
border-radius:18px;
background:#e8ddd1;
overflow:hidden;
display:grid;
place-items:center;
font-size:64px;
margin-bottom:18px
}

.courseThumb img{
width:100%;
height:100%;
object-fit:cover
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

textarea{
min-height:100px;
resize:vertical
}

.signup{
display:grid;
grid-template-columns:.85fr 1.15fr;
gap:40px
}

/* PRODUCTOS */

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

.preview,
.coursePreview{
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

/* CARRITO */

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

/* ADMIN */

.admin{
display:grid;
grid-template-columns:1fr 1fr;
gap:18px
}

.adminCourse{
background:#faf8f5;
border:1px solid #e7dfd6;
border-radius:20px;
padding:18px;
margin-bottom:18px
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

/* PAGO */

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

/* PÁGINA INDIVIDUAL DEL CURSO */

.detailHero{
padding:45px 0 80px
}

.detailGrid{
display:grid;
grid-template-columns:1fr 1fr;
gap:32px;
align-items:center
}

.detailImage{
height:460px;
border-radius:30px;
overflow:hidden;
background:linear-gradient(145deg,#111,#342b23);
display:grid;
place-items:center;
font-size:90px;
color:#fff
}

.detailImage img{
width:100%;
height:100%;
object-fit:cover
}

.detailBox{
background:rgba(255,255,255,.96);
border-radius:28px;
padding:28px;
border:1px solid #e5ddd4
}

.detailBox h1{
font-size:clamp(44px,6vw,70px)
}

.detailList{
padding-left:20px
}

.detailList li{
margin:10px 0
}

.priceGrid{
display:grid;
grid-template-columns:1fr 1fr;
gap:12px;
margin:20px 0
}

.priceBox{
background:#f3ede6;
border-radius:18px;
padding:18px
}

.priceBox h3{
margin-bottom:0
}

@media(max-width:800px){

.heroGrid,
.grid2,
.grid3,
.signup,
.admin,
.detailGrid{
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

.detailImage{
height:300px
}

.priceGrid{
grid-template-columns:1fr
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

<p class="muted">
Tocá un curso para ver toda la información.
</p>

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
<label>Nombre</label>
<input name="name" required>
</div>

<div class="field">
<label>Apellido</label>
<input name="lastname" required>
</div>

<div class="field">
<label>Número de documento</label>
<input
name="documentNumber"
required
inputmode="numeric"
>
</div>

<div class="field">
<label>Fecha de nacimiento</label>
<input
name="birthDate"
type="date"
required
>
</div>

<div class="field">
<label>WhatsApp</label>
<input
name="phone"
required
inputmode="tel"
placeholder="Ej: 11 1234 5678"
>
</div>

<div class="field">
<label>Curso</label>

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
<label>Nombre</label>
<input name="name" required>
</div>

<div class="field">
<label>WhatsApp</label>
<input name="phone" required>
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
document.querySelector(
selector
);

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

function picture(
value,
fallback,
name
){

value =
value || '';

if(
value.startsWith('data:image/') ||
value.startsWith('https://') ||
value.startsWith('http://')
){

return (
'<img src="' +
value +
'" alt="' +
(name || '') +
'">'
);

}

return (
fallback ||
value ||
'🎓'
);

}

async function init(){

cfg =
await api(
'/api/config'
);

applyBackground(
cfg.background
);

$('#courses').innerHTML =
cfg.courses
.map(
course => {

const detail =
cfg.courseDetails?.[
course.id
] || {};

return (

'<div class="card courseCard" onclick="location.href=\\'/curso/' +
course.id +
'\\'">' +

'<div class="courseThumb">' +

picture(
detail.image,
course.icon,
course.name
) +

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
money(
course.inscription
) +
'</b> · Cuota ' +
money(
course.monthly
) +
'</p>' +

'<button class="btn pri" onclick="event.stopPropagation();location.href=\\'/curso/' +
course.id +
'\\'">' +

'Ver curso' +

'</button>' +

'</div>'

);

}
)
.join('');

$('#products').innerHTML =
cfg.products
.map(
product =>

'<div class="product">' +

'<div class="pic">' +

picture(
product.emoji,
product.emoji || '🛍️',
product.name
) +

'</div>' +

'<div class="pb">' +

'<h3>' +
product.name +
'</h3>' +

'<b>' +
money(
product.price
) +
'</b>' +

'<p class="muted">Stock: ' +
product.stock +
'</p>' +

'<button class="btn pri" onclick="add(\\'' +
product.id +
'\\')">' +

'Agregar' +

'</button>' +

'</div>' +

'</div>'

)
.join('');

$('#course').innerHTML =
cfg.courses
.map(
course =>

'<option value="' +
course.id +
'">' +
course.name +
'</option>'

)
.join('');

const preselected =
localStorage.getItem(
'preselectedCourse'
);

if(
preselected &&
cfg.courses.some(
course =>
course.id === preselected
)
){

$('#course').value =
preselected;

localStorage.removeItem(
'preselectedCourse'
);

}

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
price:Number(
product.price
),
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
params.get(
'collection_status'
);

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

reference =
JSON.parse(
stored
).id || '';

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
   PÁGINA INDIVIDUAL DE CADA CURSO
===================================== */

function coursePage(courseId) {

return `
<!doctype html>

<html lang="es">

<head>

<meta charset="utf-8">

<meta
name="viewport"
content="width=device-width,initial-scale=1"
>

<title>Curso | Centro Constitución</title>

<style>
${css}
</style>

</head>

<body>

<header>

<div class="c nav">

<a href="/">

<img
class="logo"
src="/IMG_5279.jpeg"
>

<b>Centro Constitución</b>

</a>

<a href="/">
← Volver
</a>

</div>

</header>

<section class="detailHero">

<div
class="c detailGrid"
id="courseContent"
>

<p>Cargando curso...</p>

</div>

</section>

<script>

const COURSE_ID =
${JSON.stringify(courseId)};

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

function applyBackground(value){

if(!value){
return;
}

document.body.style.backgroundImage =
'linear-gradient(rgba(247,243,238,.80),rgba(247,243,238,.80)),url("' +
value +
'")';

}

function picture(
value,
fallback,
name
){

value =
value || '';

if(
value.startsWith('data:image/') ||
value.startsWith('https://') ||
value.startsWith('http://')
){

return (
'<img src="' +
value +
'" alt="' +
(name || '') +
'">'
);

}

return fallback || '🎓';

}

async function initCourse(){

try{

const response =
await fetch('/api/config');

const cfg =
await response.json();

applyBackground(
cfg.background
);

const course =
cfg.courses.find(
item =>
item.id === COURSE_ID
);

if(!course){

document.getElementById(
'courseContent'
).innerHTML =
'<div class="detailBox"><h2>Curso no encontrado</h2><a class="btn pri" href="/">Volver</a></div>';

return;

}

const detail =
cfg.courseDetails?.[
COURSE_ID
] || {};

const syllabus =
Array.isArray(
detail.syllabus
)
?
detail.syllabus
:
[];

document.title =
course.name +
' | Centro Constitución';

document.getElementById(
'courseContent'
).innerHTML =

'<div class="detailImage">' +

picture(
detail.image,
course.icon,
course.name
) +

'</div>' +

'<div class="detailBox">' +

'<small>CENTRO CONSTITUCIÓN</small>' +

'<h1>' +
course.name +
'</h1>' +

'<p class="muted">' +
(
detail.longDescription ||
course.description ||
''
) +
'</p>' +

'<p><b>Duración:</b> ' +
(
detail.duration ||
'A confirmar'
) +
'</p>' +

'<h3>¿Qué vas a aprender?</h3>' +

'<ul class="detailList">' +

syllabus
.map(
item =>
'<li>' +
item +
'</li>'
)
.join('') +

'</ul>' +

'<h3>Días y horarios</h3>' +

'<div>' +

(course.schedules || [])
.map(
schedule =>
'<span class="tag">' +
schedule +
'</span>'
)
.join('') +

'</div>' +

'<div class="priceGrid">' +

'<div class="priceBox">' +

'<small>INSCRIPCIÓN</small>' +

'<h3>' +
money(
course.inscription
) +
'</h3>' +

'</div>' +

'<div class="priceBox">' +

'<small>CUOTA</small>' +

'<h3>' +
money(
course.monthly
) +
'</h3>' +

'</div>' +

'</div>' +

'<button id="enroll" class="btn pri" style="width:100%">' +

'Inscribirme en este curso' +

'</button>' +

'</div>';

document.getElementById(
'enroll'
).onclick =
() => {

localStorage.setItem(
'preselectedCourse',
COURSE_ID
);

location.href =
'/#inscripcion';

};

}catch(error){

console.error(error);

document.getElementById(
'courseContent'
).innerHTML =
'<div class="detailBox"><h2>No se pudo cargar el curso.</h2><a class="btn pri" href="/">Volver</a></div>';

}

}

initCourse();

</script>

</body>

</html>
`;

}

app.get(
'/curso/:id',
(req,res) => {

res
.type('html')
.send(
coursePage(
req.params.id
)
);

}
);

/* =====================================
   LOGIN DEL PANEL
===================================== */

const loginPage = `
<!doctype html>

<html lang="es">

<head>

<meta charset="utf-8">

<meta
name="viewport"
content="width=device-width,initial-scale=1"
>

<title>
Panel | Centro Constitución
</title>

<style>
${css}
</style>

</head>

<body>

<div class="login">

<form
id="login"
class="loginBox"
>

<div style="text-align:center">

<img
src="/IMG_5279.jpeg"
class="logo"
style="
width:75px;
height:75px
"
>

<h2>
Panel
</h2>

<p class="muted">
Centro Constitución
</p>

</div>

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

<p id="msg"></p>

</form>

</div>

<script>

document.getElementById(
'login'
).onsubmit =
async event => {

event.preventDefault();

const data =
Object.fromEntries(
new FormData(
event.target
)
);

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
data
)
}
);

const result =
await response
.json()
.catch(()=>({}));

if(!response.ok){

document.getElementById(
'msg'
).textContent =
result.error ||
'No se pudo ingresar.';

return;

}

location.href =
'/admin/panel';

};

</script>

</body>

</html>
`;

/* =====================================
   PANEL DE ADMINISTRACIÓN
===================================== */

const adminPage = `
<!doctype html>

<html lang="es">

<head>

<meta charset="utf-8">

<meta
name="viewport"
content="width=device-width,initial-scale=1"
>

<title>
Administración | Centro Constitución
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
src="/IMG_5279.jpeg"
class="logo"
>

<b>
Administración
</b>

</div>

<a href="/">
Ver sitio
</a>

</div>

</header>

<section class="sec">

<div class="c">

<h1 style="font-size:55px">
Panel
</h1>

<p class="muted">
Desde acá podés editar el sitio.
</p>

<div class="admin">

<div class="card">

<h2>
Fondo del sitio
</h2>

<p class="muted">
Podés elegir una imagen desde tu celular y cambiar el fondo de toda la página.
</p>

<input
id="backgroundFile"
type="file"
accept="image/*"
>

<img
id="backgroundPreview"
class="backgroundPreview"
style="display:none"
>

<br>

<button
id="saveBackground"
class="btn pri"
>
Guardar fondo
</button>

<button
id="removeBackground"
class="btn secbtn"
>
Quitar fondo
</button>

<p id="backgroundMsg"></p>

</div>

<div class="card">

<h2>
Cursos
</h2>

<p class="muted">
Acá podés cambiar nombre, foto, información, duración, temario, horarios y precios.
</p>

<div id="adminCourses"></div>

</div>

</div>

</div>

</section>

<section class="sec soft">

<div class="c">

<h2>
Productos
</h2>

<p class="muted">
Editá los productos de la tienda y sus fotos.
</p>

<div
id="adminProducts"
class="grid2"
></div>

</div>

</section>

<section class="sec">

<div class="c">

<h2>
Alumnos e inscripciones
</h2>

<div id="students"></div>

</div>

</section>

<script>

let db;

let selectedBackground =
'';

const $ =
selector =>
document.querySelector(
selector
);

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

if(
response.status === 401
){

location.href =
'/admin';

throw new Error(
'Sesión vencida'
);

}

if(!response.ok){

throw new Error(
data.error ||
'Error'
);

}

return data;

}

function escapeHtml(value){

return String(
value ?? ''
)
.replaceAll(
'&',
'&amp;'
)
.replaceAll(
'<',
'&lt;'
)
.replaceAll(
'>',
'&gt;'
)
.replaceAll(
'"',
'&quot;'
);

}

function compressImage(
file,
maxWidth,
quality,
callback
){

const reader =
new FileReader();

reader.onload =
event => {

const image =
new Image();

image.onload =
() => {

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

callback(
canvas.toDataURL(
'image/jpeg',
quality
)
);

};

image.src =
event.target.result;

};

reader.readAsDataURL(
file
);

}

async function loadAdmin(){

db =
await api(
'/api/admin'
);

selectedBackground =
db.background || '';

renderBackground();

renderCourses();

renderProducts();

renderStudents();

}

function renderBackground(){

const preview =
$('#backgroundPreview');

if(
selectedBackground
){

preview.src =
selectedBackground;

preview.style.display =
'block';

}else{

preview.style.display =
'none';

}

}

$('#backgroundFile')
.onchange =
event => {

const file =
event.target.files?.[0];

if(!file){
return;
}

compressImage(
file,
1400,
0.68,
result => {

selectedBackground =
result;

renderBackground();

$('#backgroundMsg')
.textContent =
'Imagen lista. Tocá Guardar fondo.';

}
);

};

$('#saveBackground')
.onclick =
async () => {

$('#backgroundMsg')
.textContent =
'Guardando...';

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

$('#backgroundMsg')
.textContent =
'✅ Fondo guardado.';

}catch(error){

$('#backgroundMsg')
.textContent =
error.message;

}

};

$('#removeBackground')
.onclick =
async () => {

selectedBackground =
'';

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

db.background =
'';

renderBackground();

$('#backgroundMsg')
.textContent =
'✅ Fondo eliminado.';

}catch(error){

$('#backgroundMsg')
.textContent =
error.message;

}

};

/* =====================================
   EDITAR CURSOS
===================================== */

function renderCourses(){

$('#adminCourses')
.innerHTML =
db.courses
.map(
(course,index) => {

const detail =
db.courseDetails?.[
course.id
] || {};

const syllabus =
Array.isArray(
detail.syllabus
)
?
detail.syllabus.join(' | ')
:
'';

const schedules =
Array.isArray(
course.schedules
)
?
course.schedules.join(' | ')
:
'';

return ` +
"`" + `
<div
class="adminCourse"
data-course="${index}"
>

<h3>
${escapeHtml(course.name)}
</h3>

<div class="field">

<label>
Nombre del curso
</label>

<input
class="courseName"
value="${escapeHtml(course.name)}"
>

</div>

<div class="field">

<label>
Descripción corta
</label>

<textarea class="courseDescription">${escapeHtml(course.description || '')}</textarea>

</div>

<div class="field">

<label>
Foto del curso
</label>

<input
class="courseImageFile"
type="file"
accept="image/*"
>

<img
class="coursePreview"
src="${escapeHtml(detail.image || '')}"
style="${detail.image ? '' : 'display:none'}"
>

</div>

<div class="field">

<label>
Descripción completa
</label>

<textarea class="courseLongDescription">${escapeHtml(detail.longDescription || '')}</textarea>

</div>

<div class="field">

<label>
Duración
</label>

<input
class="courseDuration"
value="${escapeHtml(detail.duration || '')}"
placeholder="Ej: 4 meses"
>

</div>

<div class="field">

<label>
Temario
</label>

<textarea
class="courseSyllabus"
placeholder="Separá cada tema con |"
>${escapeHtml(syllabus)}</textarea>

</div>

<div class="field">

<label>
Horarios
</label>

<textarea
class="courseSchedules"
placeholder="Separá cada horario con |"
>${escapeHtml(schedules)}</textarea>

</div>

<div class="field">

<label>
Inscripción
</label>

<input
class="courseInscription"
type="number"
value="${Number(course.inscription || 0)}"
>

</div>

<div class="field">

<label>
Cuota
</label>

<input
class="courseMonthly"
type="number"
value="${Number(course.monthly || 0)}"
>

</div>

<button
class="btn pri saveCourse"
>

Guardar curso

</button>

<p class="courseMsg"></p>

</div>
` + "`" + `;

}
)
.join('');

document
.querySelectorAll(
'.adminCourse'
)
.forEach(
card => {

const index =
Number(
card.dataset.course
);

const course =
db.courses[
index
];

const fileInput =
card.querySelector(
'.courseImageFile'
);

fileInput.onchange =
event => {

const file =
event.target.files?.[0];

if(!file){
return;
}

compressImage(
file,
1000,
0.72,
result => {

if(
!db.courseDetails
){

db.courseDetails =
{};

}

if(
!db.courseDetails[
course.id
]
){

db.courseDetails[
course.id
] =
{};

}

db.courseDetails[
course.id
].image =
result;

const preview =
card.querySelector(
'.coursePreview'
);

preview.src =
result;

preview.style.display =
'block';

}
);

};

card.querySelector(
'.saveCourse'
).onclick =
async () => {

const msg =
card.querySelector(
'.courseMsg'
);

msg.textContent =
'Guardando...';

course.name =
card.querySelector(
'.courseName'
).value.trim();

course.description =
card.querySelector(
'.courseDescription'
).value.trim();

course.inscription =
Number(
card.querySelector(
'.courseInscription'
).value
);

course.monthly =
Number(
card.querySelector(
'.courseMonthly'
).value
);

course.schedules =
card.querySelector(
'.courseSchedules'
).value
.split('|')
.map(
item =>
item.trim()
)
.filter(Boolean);

if(
!db.courseDetails
){

db.courseDetails =
{};

}

const oldDetail =
db.courseDetails[
course.id
] || {};

db.courseDetails[
course.id
] = {

...oldDetail,

duration:
card.querySelector(
'.courseDuration'
).value.trim(),

longDescription:
card.querySelector(
'.courseLongDescription'
).value.trim(),

syllabus:
card.querySelector(
'.courseSyllabus'
).value
.split('|')
.map(
item =>
item.trim()
)
.filter(Boolean)

};

try{

await Promise.all([

api(
'/api/admin/courses',
{
method:'PUT',

body:
JSON.stringify({
courses:
db.courses
})
}
),

api(
'/api/admin/course-details',
{
method:'PUT',

body:
JSON.stringify({
courseDetails:
db.courseDetails
})
}
)

]);

msg.textContent =
'✅ Curso guardado.';

}catch(error){

msg.textContent =
error.message;

}

};

}
);

}
/* =====================================
   PRODUCTOS ADMIN
===================================== */

function renderProducts(){

$('#adminProducts')
.innerHTML =
db.products
.map(
(product,index) => {

const image =
product.emoji || '';

return `
<div
class="card"
data-product="${index}"
>

<h3>
${escapeHtml(product.name)}
</h3>

<div class="field">

<label>
Nombre
</label>

<input
class="productName"
value="${escapeHtml(product.name)}"
>

</div>

<div class="field">

<label>
Foto del producto
</label>

<input
class="productImageFile"
type="file"
accept="image/*"
>

<div class="pic productPreview">

${
image.startsWith('data:image/') ||
image.startsWith('https://') ||
image.startsWith('http://')
?
`<img src="${escapeHtml(image)}">`
:
escapeHtml(image || '🛍️')
}

</div>

</div>

<div class="field">

<label>
Precio
</label>

<input
class="productPrice"
type="number"
value="${Number(product.price || 0)}"
>

</div>

<div class="field">

<label>
Stock
</label>

<input
class="productStock"
type="number"
value="${Number(product.stock || 0)}"
>

</div>

<button
class="btn pri saveProduct"
>
Guardar producto
</button>

<p class="productMsg"></p>

</div>
`;

}
)
.join('');

document
.querySelectorAll(
'[data-product]'
)
.forEach(
card => {

const index =
Number(
card.dataset.product
);

const product =
db.products[
index
];

const fileInput =
card.querySelector(
'.productImageFile'
);

fileInput.onchange =
event => {

const file =
event.target.files?.[0];

if(!file){
return;
}

compressImage(
file,
850,
0.7,
result => {

product.emoji =
result;

card.querySelector(
'.productPreview'
).innerHTML =
'<img src="' +
result +
'">';

}
);

};

card.querySelector(
'.saveProduct'
).onclick =
async () => {

const msg =
card.querySelector(
'.productMsg'
);

msg.textContent =
'Guardando...';

product.name =
card.querySelector(
'.productName'
).value.trim();

product.price =
Number(
card.querySelector(
'.productPrice'
).value
);

product.stock =
Number(
card.querySelector(
'.productStock'
).value
);

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

msg.textContent =
'✅ Producto guardado.';

}catch(error){

msg.textContent =
error.message;

}

};

}
);

}

/* =====================================
   ALUMNOS
===================================== */

function renderStudents(){

if(
!db.signups ||
!db.signups.length
){

$('#students')
.innerHTML =
'<div class="card"><p>Todavía no hay inscripciones.</p></div>';

return;

}

$('#students')
.innerHTML =
db.signups
.map(
signup => {

const statusClass =
signup.status === 'approved'
?
'approved'
:
'pending';

const statusText =
signup.status === 'approved'
?
'Pago aprobado'
:
signup.status || 'Pendiente';

const whatsapp =
String(
signup.phone || ''
)
.replace(/\D/g,'');

let whatsappNumber =
whatsapp;

if(
whatsappNumber.startsWith('11')
){

whatsappNumber =
'549' +
whatsappNumber;

}

return `
<div class="student">

<h3>
${escapeHtml(signup.name || '')}
${escapeHtml(signup.lastname || '')}
</h3>

<p>
<b>Documento:</b>
${escapeHtml(signup.document_number || '')}
</p>

<p>
<b>Fecha de nacimiento:</b>
${escapeHtml(signup.birth_date || '')}
</p>

<p>
<b>WhatsApp:</b>
${escapeHtml(signup.phone || '')}
</p>

<p>
<b>Curso:</b>
${escapeHtml(signup.course_name || '')}
</p>

<p>
<b>Horario:</b>
${escapeHtml(signup.schedule || '')}
</p>

<p>
<b>Importe:</b>
${money(Number(signup.amount || 0))}
</p>

<span class="status ${statusClass}">
${escapeHtml(statusText)}
</span>

<br><br>

<a
class="btn green"
target="_blank"
href="https://wa.me/${whatsappNumber}"
>
Hablar por WhatsApp
</a>

</div>
`;

}
)
.join('');

}

/* =====================================
   INICIAR PANEL
===================================== */

loadAdmin()
.catch(
error => {

console.error(
error
);

}
);

</script>

</body>

</html>
`;

/* =====================================
   RUTAS DE PÁGINAS
===================================== */

app.get(
'/',
(_req,res) => {

res
.type('html')
.send(home);

}
);

app.get(
'/admin',
(_req,res) => {

res
.type('html')
.send(loginPage);

}
);

app.get(
'/admin/panel',
(_req,res) => {

res
.type('html')
.send(adminPage);

}
);

/* =====================================
   INICIAR SERVIDOR
===================================== */

app.listen(
PORT,
() => {

console.log(
`Centro Constitución funcionando en puerto ${PORT}`
);

}
);
