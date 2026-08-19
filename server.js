
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/,'');
const JWT_SECRET = process.env.JWT_SECRET || 'cambiar-secreto';

app.use(express.json());
app.use(cookieParser());
app.get('/IMG_5279.jpeg',(_req,res)=>res.sendFile(process.cwd()+'/IMG_5279.jpeg'));
let courses = [
  {id:'barberia',icon:'💈',name:'Barbería',description:'Aprendé técnicas de corte masculino con máquina, tijera y navaja.',schedules:['Martes de 16 a 18 hs','Sábados de 9 a 11 hs','Sábados de 11 a 13 hs'],inscription:20000,monthly:80000},
  {id:'peluqueria',icon:'💇‍♀️',name:'Peluquería',description:'Formación integral con práctica, corte, brushing, peinados y tratamientos.',schedules:['Miércoles de 15 a 18 hs','Sábados de 9 a 12 hs'],inscription:20000,monthly:80000},
  {id:'colorimetria',icon:'🎨',name:'Colorimetría',description:'Formación profesional en color y diagnóstico.',schedules:['Horario próximamente'],inscription:20000,monthly:80000},
  {id:'manicuria',icon:'💅',name:'Manicuría y Pedicuría',description:'Manicuría, pedicuría y esmaltado tradicional y semipermanente.',schedules:['Horario próximamente'],inscription:20000,monthly:80000}
];
let products = [
  {id:'p1',emoji:'✂️',name:'Tijera profesional',price:45000,stock:10},
  {id:'p2',emoji:'🪒',name:'Máquina de corte',price:90000,stock:8},
  {id:'p3',emoji:'💨',name:'Secador profesional',price:70000,stock:6}
];
let signups = [], orders = [];

async function mpRequest(path, options={}) {
  if(!process.env.MP_ACCESS_TOKEN) throw new Error('MP_NOT_CONFIGURED');
  const r = await fetch('https://api.mercadopago.com'+path,{
    ...options,
    headers:{Authorization:`Bearer ${process.env.MP_ACCESS_TOKEN}`,'Content-Type':'application/json'}
  });
  const d = await r.json();
  if(!r.ok) throw new Error(d.message || 'Error Mercado Pago');
  return d;
}
async function createPref(title, amount, ref, email, name) {
  return mpRequest('/checkout/preferences',{
    method:'POST',
    body:JSON.stringify({
      items:[{title,quantity:1,currency_id:'ARS',unit_price:Number(amount)}],
      external_reference:ref,
      payer:{email,name},
      back_urls:{
        success:`${PUBLIC_URL}/?pay=success`,
        pending:`${PUBLIC_URL}/?pay=pending`,
        failure:`${PUBLIC_URL}/?pay=failure`
      },
      auto_return:'approved',
      notification_url:`${PUBLIC_URL}/api/webhook`
    })
  });
}

app.get('/api/config',(_req,res)=>res.json({courses,products}));
app.post('/api/signup',async(req,res)=>{
  const c=courses.find(x=>x.id===req.body.courseId);
  if(!c)return res.status(400).json({error:'Curso inválido'});
  const x={id:'ins-'+Date.now(),...req.body,courseName:c.name,amount:c.inscription,status:'pending'};
  signups.unshift(x);
  try{
    const p=await createPref(`Inscripción ${c.name}`,c.inscription,x.id,x.email,x.name);
    res.json({checkoutUrl:p.init_point||p.sandbox_init_point});
  }catch(e){
  console.error('Mercado Pago signup error:', e);
  res.status(503).json({message:'Mercado Pago: '+e.message});
}
});
app.post('/api/order',async(req,res)=>{
  let total=0;
  for(const i of req.body.items||[]){
    const p=products.find(x=>x.id===i.productId);
    if(!p)return res.status(400).json({error:'Producto inválido'});
    total+=p.price*Number(i.qty||1);
  }
  const o={id:'ped-'+Date.now(),customer:req.body.customer,items:req.body.items,total,status:'pending'};
  orders.unshift(o);
  try{
    const p=await createPref('Pedido Centro Constitución',total,o.id,o.customer.email,o.customer.name);
    res.json({checkoutUrl:p.init_point||p.sandbox_init_point});
  }catch{
    res.status(503).json({message:'Pedido guardado. Falta conectar Mercado Pago.'});
  }
});
app.post('/api/webhook',async(req,res)=>{
  res.sendStatus(200);
  try{
    const id=req.query['data.id']||req.body?.data?.id;
    if(!id)return;
    const p=await mpRequest('/v1/payments/'+id);
    const ref=p.external_reference;
    const s=signups.find(x=>x.id===ref);
    if(s){s.status=p.status==='approved'?'paid':p.status;return}
    const o=orders.find(x=>x.id===ref);
    if(o)o.status=p.status==='approved'?'paid':p.status;
  }catch{}
});

function auth(req,res,next){
  try{
    const t=req.cookies.admin;
    if(!t)return res.status(401).end();
    jwt.verify(t,JWT_SECRET); next();
  }catch{res.status(401).end()}
}
app.post('/api/login',(req,res)=>{
  const email=process.env.ADMIN_EMAIL||'admin@centroconstitucion.com';
  const pass=process.env.ADMIN_PASSWORD||'Cambiar123!';
  if(req.body.email!==email||req.body.password!==pass)return res.status(401).json({error:'Datos incorrectos'});
  res.cookie('admin',jwt.sign({email},JWT_SECRET,{expiresIn:'12h'}),{httpOnly:true,sameSite:'lax'});
  res.json({ok:true});
});
app.get('/api/admin',auth,(_req,res)=>res.json({courses,products,signups,orders}));
app.put('/api/admin/courses',auth,(req,res)=>{courses=req.body.courses;res.json({ok:true})});
app.put('/api/admin/products',auth,(req,res)=>{products=req.body.products;res.json({ok:true})});

const css = `
*{box-sizing:border-box}
body{margin:0;font-family:Arial;background:#f7f3ee;color:#181818}
a{text-decoration:none;color:inherit}
.c{width:min(1120px,calc(100% - 30px));margin:auto}
header{position:sticky;top:0;background:#f7f3eef5;border-bottom:1px solid #e5ddd4;z-index:5}
.nav{height:72px;display:flex;align-items:center;justify-content:space-between}
.logo{width:42px;height:42px;border-radius:50%;object-fit:cover;margin-right:8px;vertical-align:middle;background:#fff}
.hero{padding:70px 0}
.heroGrid{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center}
h1{font-family:Georgia;font-size:clamp(48px,7vw,86px);line-height:.95;margin:10px 0}
h2{font-family:Georgia;font-size:42px}
.muted{color:#716c66}
.heroCard{height:430px;border-radius:32px;background:linear-gradient(145deg,#111,#342b23);color:#fff;padding:28px;display:flex;flex-direction:column;justify-content:space-between}
.heroCard b{font-family:Georgia;font-size:46px}
.sec{padding:80px 0}
.soft{background:#efe7dd}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.card{background:#fff;border:1px solid #e5ddd4;border-radius:24px;padding:22px}
.tag{display:inline-block;background:#f2ece5;border-radius:999px;padding:7px 10px;font-size:12px;margin:4px}
.btn{border:0;border-radius:999px;padding:13px 18px;font-weight:800;cursor:pointer}
.pri{background:#171717;color:#fff}
.secbtn{background:#fff;border:1px solid #ddd}
.form{background:#fff;padding:24px;border-radius:24px}
.field{margin-bottom:12px}
.field label{display:block;font-size:13px;font-weight:800;margin-bottom:6px}
input,select,textarea{width:100%;padding:13px;border:1px solid #ddd;border-radius:12px}
.signup{display:grid;grid-template-columns:.85fr 1.15fr;gap:40px}
.product{background:#fff;border-radius:22px;overflow:hidden;border:1px solid #ddd}
.pic{height:180px;background:#e8ddd1;display:grid;place-items:center;font-size:58px}
.pb{padding:18px}
.drawer{position:fixed;inset:0;background:#0008;display:none;justify-content:flex-end;z-index:10}
.drawer.open{display:flex}
.panel{width:min(430px,100%);height:100%;background:#fff;padding:22px;overflow:auto}
.row{padding:12px 0;border-bottom:1px solid #ddd}
.admin{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.login{min-height:100vh;display:grid;place-items:center}
.loginBox{width:min(420px,calc(100% - 30px));background:#fff;padding:28px;border-radius:24px}
@media(max-width:800px){
  .heroGrid,.grid2,.grid3,.signup,.admin{grid-template-columns:1fr}
  .heroCard{height:320px}
}
`;
const home = `
<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Centro Constitución</title><style>${css}</style></head><body>
<header><div class="c nav"><div><img class="logo" src="/IMG_5279.jpeg" alt="Centro Constitución"><b>Centro Constitución</b></div><a href="/admin">Panel</a></div></header>
<section class="hero"><div class="c heroGrid"><div><small>FORMACIÓN • BELLEZA • PROFESIÓN</small><h1>Transformá tu talento en una profesión.</h1><p class="muted">Cursos presenciales en Constitución y herramientas profesionales.</p><a class="btn pri" href="#inscripcion">Inscribirme ahora</a></div><div class="heroCard"><small>CENTRO CONSTITUCIÓN</small><b>Tu próximo paso empieza acá.</b><small>Av. Brasil 1223 · Constitución</small></div></div></section>
<section class="sec"><div class="c"><h2>Cursos</h2><div id="courses" class="grid2"></div></div></section>
<section class="sec soft" id="inscripcion"><div class="c signup"><div><h2>Inscripción online</h2><p class="muted">Elegí el curso, completá tus datos y pagá la inscripción.</p></div><form id="signup" class="form"><div class="field"><label>Nombre</label><input name="name" required></div><div class="field"><label>DNI</label><input name="dni" required></div><div class="field"><label>WhatsApp</label><input name="phone" required></div><div class="field"><label>Email</label><input name="email" type="email" required></div><div class="field"><label>Curso</label><select id="course" name="courseId"></select></div><div class="field"><label>Horario</label><select id="schedule" name="schedule"></select></div><button class="btn pri" style="width:100%">Inscribirme y pagar</button><p id="msg"></p></form></div></section>
<section class="sec"><div class="c"><div style="display:flex;justify-content:space-between;align-items:center"><h2>Tienda</h2><button class="btn secbtn" id="cartBtn">🛒 Carrito <span id="count">0</span></button></div><div id="products" class="grid3"></div></div></section>
<section class="sec" style="background:#171717;color:#fff"><div class="c"><h2>Av. Brasil 1223</h2><p>Constitución, CABA</p><a class="btn secbtn" target="_blank" href="https://wa.me/541166061100">WhatsApp</a></div></section>
<div id="drawer" class="drawer"><div class="panel"><button id="close" class="btn secbtn">Cerrar</button><h2>Carrito</h2><div id="items"></div><h3 id="total">$0</h3><form id="order"><div class="field"><label>Nombre</label><input name="name" required></div><div class="field"><label>WhatsApp</label><input name="phone" required></div><div class="field"><label>Email</label><input name="email" type="email" required></div><button class="btn pri" style="width:100%">Comprar con Mercado Pago</button><p id="omsg"></p></form></div></div>
<script>
let cfg,cart=[];const $=x=>document.querySelector(x);const money=n=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n);
async function api(u,o={}){const r=await fetch(u,{headers:{'Content-Type':'application/json'},...o});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||d.message||'Error');return d}
async function init(){cfg=await api('/api/config');$('#courses').innerHTML=cfg.courses.map(c=>'<div class="card"><div style="font-size:30px">'+c.icon+'</div><h3>'+c.name+'</h3><p class="muted">'+c.description+'</p><div>'+c.schedules.map(s=>'<span class="tag">'+s+'</span>').join('')+'</div><p><b>Inscripción '+money(c.inscription)+'</b> · Cuota '+money(c.monthly)+'</p><button class="btn pri" onclick="choose(\\''+c.id+'\\')">Inscribirme</button></div>').join('');$('#products').innerHTML=cfg.products.map(p=>'<div class="product"><div class="pic">'+p.emoji+'</div><div class="pb"><h3>'+p.name+'</h3><b>'+money(p.price)+'</b><br><button class="btn pri" style="margin-top:10px" onclick="add(\\''+p.id+'\\')">Agregar</button></div></div>').join('');$('#course').innerHTML=cfg.courses.map(c=>'<option value="'+c.id+'">'+c.name+'</option>').join('');sched()}
function sched(){const c=cfg.courses.find(x=>x.id===$('#course').value);$('#schedule').innerHTML=c.schedules.map(s=>'<option>'+s+'</option>').join('')}
window.choose=id=>{$('#course').value=id;sched();location.hash='inscripcion'};$('#course').onchange=sched;
window.add=id=>{const p=cfg.products.find(x=>x.id===id);const i=cart.find(x=>x.productId===id);if(i)i.qty++;else cart.push({productId:id,name:p.name,price:p.price,qty:1});render()}
function render(){$('#count').textContent=cart.reduce((a,b)=>a+b.qty,0);$('#items').innerHTML=cart.map(i=>'<div class="row">'+i.name+' × '+i.qty+' — '+money(i.price*i.qty)+'</div>').join('')||'<p>Carrito vacío</p>';$('#total').textContent=money(cart.reduce((a,b)=>a+b.price*b.qty,0))}
$('#cartBtn').onclick=()=>$('#drawer').classList.add('open');$('#close').onclick=()=>$('#drawer').classList.remove('open');
$('#signup').onsubmit=async e=>{e.preventDefault();try{const d=await api('/api/signup',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});if(d.checkoutUrl)location.href=d.checkoutUrl;else $('#msg').textContent=d.message}catch(e){$('#msg').textContent=e.message}}
$('#order').onsubmit=async e=>{e.preventDefault();try{const customer=Object.fromEntries(new FormData(e.target));const d=await api('/api/order',{method:'POST',body:JSON.stringify({customer,items:cart.map(x=>({productId:x.productId,qty:x.qty}))})});if(d.checkoutUrl)location.href=d.checkoutUrl;else $('#omsg').textContent=d.message}catch(e){$('#omsg').textContent=e.message}}
init();render();
</script></body></html>`;

const login = `
<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div class="login"><form id="f" class="loginBox"><img class="logo" src="/IMG_5279.jpeg" alt="Centro Constitución"><h2>Panel</h2><div class="field"><label>Email</label><input name="email" type="email" required></div><div class="field"><label>Contraseña</label><input name="password" type="password" required></div><button class="btn pri" style="width:100%">Ingresar</button><p id="m"></p></form></div><script>document.getElementById('f').onsubmit=async e=>{e.preventDefault();const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});if(r.ok)location.href='/admin';else document.getElementById('m').textContent='Datos incorrectos'}</script></body></html>`;

const admin = `
<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><header><div class="c nav"><b><img class="logo" src="/IMG_5279.jpeg" alt="Centro Constitución">Administración</b><a href="/">Ver web</a></div></header><section class="sec"><div class="c admin"><div class="card"><h2>Cursos</h2><div id="ca"></div><button class="btn pri" onclick="addC()">+ Curso</button></div><div class="card"><h2>Productos</h2><div id="pa"></div><button class="btn pri" onclick="addP()">+ Producto</button></div><div class="card"><h2>Inscripciones</h2><div id="sa"></div></div><div class="card"><h2>Pedidos</h2><div id="oa"></div></div></div></section><script>
let db;async function api(u,o={}){const r=await fetch(u,{headers:{'Content-Type':'application/json'},...o});if(r.status===401){location.href='/login';throw 0}return r.json()}
async function load(){db=await api('/api/admin');render()}
function render(){ca.innerHTML=db.courses.map((c,i)=>'<div class="row"><input value="'+c.name+'" onchange="db.courses['+i+'].name=this.value"><textarea onchange="db.courses['+i+'].description=this.value">'+c.description+'</textarea><input value="'+c.schedules.join(' | ')+'" onchange="db.courses['+i+'].schedules=this.value.split(\\'|\\').map(x=>x.trim())"><input type="number" value="'+c.inscription+'" onchange="db.courses['+i+'].inscription=+this.value"><input type="number" value="'+c.monthly+'" onchange="db.courses['+i+'].monthly=+this.value"><button class="btn secbtn" onclick="saveC()">Guardar</button></div>').join('');pa.innerHTML=db.products.map((p,i)=>'<div class="row"><input value="'+p.name+'" onchange="db.products['+i+'].name=this.value"><input type="number" value="'+p.price+'" onchange="db.products['+i+'].price=+this.value"><input type="number" value="'+p.stock+'" onchange="db.products['+i+'].stock=+this.value"><button class="btn secbtn" onclick="saveP()">Guardar</button></div>').join('');sa.innerHTML=db.signups.map(x=>'<div class="row"><b>'+x.name+'</b><br>'+x.courseName+' · '+x.schedule+'<br>'+x.status+'</div>').join('')||'Sin inscripciones';oa.innerHTML=db.orders.map(x=>'<div class="row"><b>'+x.customer.name+'</b><br>$'+x.total+' · '+x.status+'</div>').join('')||'Sin pedidos'}
window.saveC=()=>api('/api/admin/courses',{method:'PUT',body:JSON.stringify({courses:db.courses})}).then(load);window.saveP=()=>api('/api/admin/products',{method:'PUT',body:JSON.stringify({products:db.products})}).then(load);window.addC=()=>{db.courses.push({id:'c'+Date.now(),icon:'🎓',name:'Nuevo curso',description:'Descripción',schedules:['Horario próximamente'],inscription:20000,monthly:80000});render()};window.addP=()=>{db.products.push({id:'p'+Date.now(),emoji:'🛍️',name:'Nuevo producto',price:0,stock:0});render()};load();
</script></body></html>`;

app.get('/',(_req,res)=>res.type('html').send(home));
app.get('/login',(_req,res)=>res.type('html').send(login));
app.get('/admin',auth,(_req,res)=>res.type('html').send(admin));
app.listen(PORT,()=>console.log('Centro Constitución en puerto '+PORT));
