// SPA Router and Views V7 (TailwindCSS Refactor)

const app = {
  root: document.getElementById('app-root'),
  currentFilter: 'Todos',
  
  navigate: (view, params = {}) => {
    window.scrollTo(0,0);
    app.renderNavAuth();

    switch(view) {
      case 'home':
        app.root.innerHTML = views.home();
        break;
      case 'catalog':
        if (params.filter) app.currentFilter = params.filter;
        else app.currentFilter = 'Todos';
        app.root.innerHTML = views.catalog();
        break;
      case 'course':
        app.root.innerHTML = views.courseDetail(params.id);
        break;
      case 'intranet':
        if (!window.db.currentUser) { app.showLoginModal(); return; }
        app.root.innerHTML = views.intranet();
        break;
      case 'player':
        if (!window.db.currentUser) { app.showLoginModal(); return; }
        if (!window.dbAPI.hasCourse(params.id)) {
          alert('No tienes acceso a este curso.');
          app.navigate('catalog'); return;
        }
        app.root.innerHTML = views.player(params.id);
        break;
      case 'page':
        app.root.innerHTML = views.page(params.slug);
        break;
      default:
        app.root.innerHTML = views.home();
    }
  },

  renderNavAuth: () => {
    const container = document.getElementById('nav-auth-container');
    const mobileContainer = document.getElementById('mobile-auth-container');
    if (window.db.currentUser) {
      const authHtml = `
        <span class="text-text-secondary mr-4 font-bold">Hola, ${window.db.currentUser.name.split(' ')[0]}</span>
        <button class="btn btn-outline" onclick="app.navigate('intranet'); app.closeMobileMenu();">Intranet</button>
        <button class="btn btn-outline border-red-500 text-red-500 hover:bg-red-500/10" onclick="app.logout(); app.closeMobileMenu();">Salir</button>
      `;
      container.innerHTML = authHtml;
      mobileContainer.innerHTML = `<div class="flex flex-col gap-4">${authHtml}</div>`;
    } else {
      const authHtml = `<button class="btn btn-outline" onclick="app.showLoginModal(); app.closeMobileMenu();">Ingresar</button>`;
      container.innerHTML = authHtml;
      mobileContainer.innerHTML = authHtml;
    }
  },

  toggleMobileMenu: () => {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('active');
  },
  
  closeMobileMenu: () => {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.remove('active');
  },

  logout: () => { window.dbAPI.logout(); app.navigate('home'); },
  setFilter: (category) => { app.currentFilter = category; app.root.innerHTML = views.catalog(); },

  playTrailer: (courseId) => {
    const c = window.dbAPI.getCourse(courseId);
    const html = `
      <div class="relative w-full max-w-5xl mx-auto animate-[slideIn_0.3s_ease-out]">
        <button class="absolute -top-10 right-0 text-text-secondary hover:text-white text-4xl bg-transparent border-none cursor-pointer z-50" onclick="app.closeModal()">&times;</button>
        <video class="w-full aspect-video bg-black rounded-xl border border-glass-border object-cover shadow-2xl" controls autoplay>
          <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
          Tu navegador no soporta videos HTML5.
        </video>
      </div>
    `;
    app.showModal(html);
  },

  showModal: (htmlContent) => {
    document.getElementById('modal-content').innerHTML = htmlContent;
    document.getElementById('modal-container').classList.remove('hidden');
  },
  closeModal: () => { 
    document.getElementById('modal-container').classList.add('hidden'); 
    document.getElementById('modal-content').innerHTML = ''; 
  },

  showLoginModal: () => {
    const html = `
      <div class="bg-navy-dark border border-glass-border rounded-2xl w-full max-w-md p-8 relative shadow-2xl mx-auto">
        <button class="absolute top-4 right-4 text-text-secondary hover:text-white text-3xl bg-transparent border-none cursor-pointer leading-none" onclick="app.closeModal()">&times;</button>
        <div class="text-center mb-8">
          <div class="logo justify-center mb-2">Laboralize<span class="gold-dot">.</span></div>
          <p class="text-text-secondary text-sm">Ingresa a tu cuenta para continuar</p>
          <p class="text-text-secondary text-xs mt-2">Prueba: alumno@laboralize.pe / 123</p>
        </div>
        <div class="mb-5">
          <label class="block text-xs text-text-secondary mb-2 uppercase tracking-wide">Correo Electrónico</label>
          <input type="email" id="login-email" class="form-control" value="alumno@laboralize.pe">
        </div>
        <div class="mb-8">
          <label class="block text-xs text-text-secondary mb-2 uppercase tracking-wide">Contraseña</label>
          <input type="password" id="login-password" class="form-control" value="123">
        </div>
        <button class="btn btn-primary w-full py-3 text-lg font-bold" onclick="app.doLogin()">Iniciar Sesión</button>
        <div class="mt-6 text-center text-sm text-text-secondary">
          ¿No tienes cuenta? <a href="#" class="text-accent-gold hover:underline">Regístrate aquí</a>
        </div>
      </div>
    `;
    app.showModal(html);
  },

  doLogin: () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    if (window.dbAPI.login(email, pass)) { app.closeModal(); app.navigate('intranet'); } 
    else { alert('Credenciales incorrectas'); }
  },

  showCheckoutModal: (courseId) => {
    if (!window.db.currentUser) {
      alert('Inicia sesión o crea una cuenta para comprar.'); app.showLoginModal(); return;
    }
    const course = window.dbAPI.getCourse(courseId);
    const html = `
      <div class="bg-navy-dark border border-glass-border rounded-2xl w-full max-w-md p-8 relative shadow-2xl mx-auto">
        <button class="absolute top-4 right-4 text-text-secondary hover:text-white text-3xl bg-transparent border-none cursor-pointer leading-none" onclick="app.closeModal()">&times;</button>
        <div class="text-center mb-6">
          <span class="text-[#009ee3] font-bold text-2xl">MercadoPago</span>
          <div class="text-xs text-text-secondary mt-1">Entorno de Simulación</div>
        </div>
        <h3 class="mb-4 text-xl font-bold font-outfit text-white">Finalizar Compra</h3>
        <p class="text-text-secondary mb-8">Estás comprando: <strong class="text-white">${course.title}</strong></p>
        <div class="bg-black/30 p-6 rounded-lg mb-8 flex justify-between items-center">
          <span class="text-text-secondary">Total a pagar:</span>
          <span class="text-3xl font-bold text-accent-gold">S/ ${course.price.toFixed(2)}</span>
        </div>
        <div class="mb-6">
          <label class="block text-sm text-text-secondary mb-2">Número de Tarjeta (Simulado)</label>
          <input type="text" class="form-control text-center tracking-widest text-lg" value="4555 5555 5555 5555" readonly>
        </div>
        <button class="btn btn-success w-full mt-4 py-4 text-lg uppercase tracking-wide" onclick="app.doPurchase(${course.id})">
          Pagar y Desbloquear Curso
        </button>
      </div>
    `;
    app.showModal(html);
  },

  showB2BModal: () => {
    const html = `
      <div class="bg-navy-dark border border-glass-border rounded-2xl w-full max-w-md p-8 relative shadow-2xl mx-auto">
        <button class="absolute top-4 right-4 text-text-secondary hover:text-white text-4xl bg-transparent border-none cursor-pointer leading-none" onclick="app.closeModal()">&times;</button>
        <div class="text-center mb-8">
          <div class="inline-block px-4 py-1 bg-accent-gold/10 border border-accent-gold text-accent-gold rounded-full text-xs font-bold mb-4 uppercase tracking-widest">
            LABORALIZE PARA EMPRESAS
          </div>
          <h2 class="text-3xl font-outfit font-bold text-white mb-2">Contacto Corporativo</h2>
          <p class="text-text-secondary text-sm">Capacita a tu equipo o agenda una mentoría privada.</p>
        </div>
        <div class="flex flex-col gap-5">
          <div>
            <label class="block text-xs text-text-secondary mb-2 uppercase tracking-wide">Nombre Completo</label>
            <input type="text" class="form-control" placeholder="Ej. Roberto Sánchez">
          </div>
          <div>
            <label class="block text-xs text-text-secondary mb-2 uppercase tracking-wide">Empresa y Cargo</label>
            <input type="text" class="form-control" placeholder="Ej. Gerente de RRHH en Tech Corp">
          </div>
          <div>
            <label class="block text-xs text-text-secondary mb-2 uppercase tracking-wide">Correo Corporativo</label>
            <input type="email" class="form-control" placeholder="roberto@techcorp.com">
          </div>
          <div>
            <label class="block text-xs text-text-secondary mb-2 uppercase tracking-wide">¿En qué te ayudamos?</label>
            <select class="form-control bg-navy-dark text-white cursor-pointer">
              <option>Capacitación masiva de personal</option>
              <option>Mentoría ejecutiva 1 a 1</option>
              <option>Diagnóstico y Auditoría legal</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary w-full mt-8 py-4 text-lg font-bold" onclick="alert('¡Solicitud enviada! Nos contactaremos en las próximas 24 horas.'); app.closeModal();">
          Solicitar Información
        </button>
      </div>
    `;
    app.showModal(html);
  },

  doPurchase: (courseId) => {
    window.dbAPI.buyCourse(courseId); app.closeModal();
    setTimeout(() => { alert('¡Pago Exitoso por MercadoPago! Tu curso se ha desbloqueado.'); app.navigate('intranet'); }, 400);
  },

  toggleAccordion: (element) => { 
    const content = element.nextElementSibling;
    content.classList.toggle('hidden');
    const icon = element.querySelector('.acc-icon');
    icon.textContent = content.classList.contains('hidden') ? '+' : '-';
  }
};

const views = {
  home: () => {
    const featured = window.db.courses.slice(0,3).map(c => `
      <div class="card flex flex-col h-full group" onclick="app.navigate('course', {id: ${c.id}})">
        <div class="overflow-hidden relative h-48">
          <img src="${c.image}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${c.title}">
          <div class="absolute inset-0 bg-gradient-to-t from-navy-primary to-transparent opacity-60"></div>
        </div>
        <div class="p-6 flex flex-col flex-grow relative z-10">
          <div class="text-accent-gold text-xs font-bold uppercase tracking-wider mb-2">${c.category}</div>
          <div class="text-xl font-outfit font-bold mb-3 text-white group-hover:text-accent-gold transition-colors">${c.title}</div>
          <div class="text-text-secondary text-sm mb-6 flex-grow">${c.description.substring(0, 80)}...</div>
          <div class="flex justify-between items-center mt-auto pt-4 border-t border-glass-border group-hover:border-accent-gold/30 transition-colors">
            <span class="font-bold text-lg text-white">S/ ${c.price.toFixed(2)}</span>
            <span class="text-accent-gold font-bold text-sm flex items-center gap-2">Ver detalles <span class="group-hover:translate-x-1 transition-transform">&rarr;</span></span>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="w-full relative overflow-x-hidden">
        
        <!-- Blobs decorativos de fondo ancho completo -->
        <div class="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div class="absolute -top-32 -left-10 md:left-0 w-[400px] h-[400px] bg-accent-gold/20 rounded-full blur-[120px]"></div>
          <div class="absolute top-10 -right-10 md:right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]"></div>
        </div>

        <div class="ed-container relative z-10">
          
          <!-- HERO SECTION -->
          <section class="py-12 md:py-24 text-center max-w-4xl mx-auto relative">

          
          <div class="inline-block px-4 py-2 bg-accent-gold/10 border border-accent-gold text-accent-gold rounded-full text-xs font-bold mb-8 uppercase tracking-widest animate-[slideIn_0.8s_ease-out]">
            MENTORÍA EJECUTIVA Y EDUCACIÓN CORPORATIVA
          </div>
          <h1 class="text-4xl md:text-6xl font-outfit font-extrabold mb-6 leading-tight animate-[slideIn_1s_ease-out]">
            Domina el Derecho Corporativo <br class="hidden md:block">y las Finanzas
          </h1>
          <p class="text-lg text-text-secondary mb-10 max-w-2xl mx-auto animate-[slideIn_1.2s_ease-out]">
            Aprende con Carolina, Educadora Ejecutiva y Mentora, a tu propio ritmo. Accede a contenido premium diseñado exclusivamente para profesionales que buscan escalar al siguiente nivel en el mercado latinoamericano.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4 animate-[slideIn_1.4s_ease-out]">
            <button class="btn btn-primary text-lg px-10 py-4 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-shadow" onclick="app.navigate('catalog')">Comenzar a Aprender</button>
            <button class="btn btn-outline text-lg px-10 py-4" onclick="app.showB2BModal()">Contactar a Ventas</button>
          </div>
        </section>

        <!-- LOGOS / TRUST SIGNALS -->
        <section class="flex flex-wrap justify-center gap-8 md:gap-16 py-8 border-y border-glass-border mb-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <span class="text-2xl font-outfit font-extrabold text-white transform hover:scale-110 transition-transform cursor-default">ESTUDIO GÁLVEZ</span>
          <span class="text-2xl font-outfit font-extrabold text-white transform hover:scale-110 transition-transform cursor-default">CORP L&F</span>
          <span class="text-2xl font-outfit font-extrabold text-white transform hover:scale-110 transition-transform cursor-default">TECH LEGAL</span>
          <span class="text-2xl font-outfit font-extrabold text-white transform hover:scale-110 transition-transform cursor-default">LEX GROUP</span>
        </section>

        <!-- LA METODOLOGÍA CAROLINA (NUEVA SECCIÓN) -->
        <section class="mb-32 relative">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent-gold/5 blur-[120px] pointer-events-none rounded-full"></div>
          <div class="flex flex-col lg:flex-row gap-16 items-center">
            <div class="flex-1 relative group cursor-pointer">
              <div class="absolute -inset-1 bg-gradient-to-r from-accent-gold to-yellow-600 rounded-2xl blur opacity-25 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
              <img src="assets/carolina.jpg" class="relative w-full h-[500px] object-cover rounded-2xl border border-glass-border shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-500" alt="Metodología Carolina">
              
              <!-- Floating Card -->
              <div class="absolute -bottom-6 -right-6 md:bottom-10 md:-right-10 bg-navy-dark border border-glass-border p-6 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-300">
                <div class="flex items-center gap-4">
                  <div class="bg-accent-gold/20 p-3 rounded-full text-accent-gold text-2xl">⚖️</div>
                  <div>
                    <div class="text-white font-bold font-outfit text-xl">10+ Años</div>
                    <div class="text-text-secondary text-sm">Experiencia Corporativa</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex-1">
              <h2 class="text-sm font-bold text-accent-gold uppercase tracking-widest mb-2">Educación Ejecutiva</h2>
              <h3 class="text-4xl font-outfit font-extrabold text-white mb-6 leading-tight">La Metodología <br>Carolina</h3>
              <p class="text-text-secondary text-lg mb-8 leading-relaxed">
                Olvídate de la teoría abstracta. Mi enfoque como Mentora Corporativa se basa en <strong>casos de la vida real, jurisprudencia reciente y estrategias de compliance</strong> que las empresas Top utilizan para evitar contingencias millonarias.
              </p>
              
              <div class="flex flex-col gap-6">
                <div class="flex items-start gap-4 group">
                  <div class="w-12 h-12 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center text-accent-gold group-hover:bg-accent-gold group-hover:text-black transition-colors shrink-0">1</div>
                  <div>
                    <h4 class="text-white font-bold mb-1 group-hover:text-accent-gold transition-colors">Diagnóstico Práctico</h4>
                    <p class="text-text-secondary text-sm">Aprende analizando problemas legales reales que enfrentan los directorios empresariales hoy.</p>
                  </div>
                </div>
                <div class="flex items-start gap-4 group">
                  <div class="w-12 h-12 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center text-accent-gold group-hover:bg-accent-gold group-hover:text-black transition-colors shrink-0">2</div>
                  <div>
                    <h4 class="text-white font-bold mb-1 group-hover:text-accent-gold transition-colors">Rutas de Aprendizaje</h4>
                    <p class="text-text-secondary text-sm">Contenido directo al grano diseñado para encajar en la agenda de un profesional ocupado.</p>
                  </div>
                </div>
                <div class="flex items-start gap-4 group">
                  <div class="w-12 h-12 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center text-accent-gold group-hover:bg-accent-gold group-hover:text-black transition-colors shrink-0">3</div>
                  <div>
                    <h4 class="text-white font-bold mb-1 group-hover:text-accent-gold transition-colors">Validación Corporativa</h4>
                    <p class="text-text-secondary text-sm">Conocimientos accionables respaldados por certificaciones digitales verificables.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CASOS DE ÉXITO / TESTIMONIOS (INTERACTIVOS) -->
        <section class="mb-32">
          <h2 class="text-3xl md:text-4xl font-outfit font-bold text-center mb-4">Casos de Éxito</h2>
          <p class="text-text-secondary text-center max-w-2xl mx-auto mb-16">Profesionales y empresas que han escalado sus operaciones y protegido su patrimonio gracias a nuestras capacitaciones.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-gradient-to-b from-white/5 to-transparent border border-glass-border p-8 rounded-2xl hover:-translate-y-3 transition-transform duration-300 relative group overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-accent-gold/10 rounded-bl-[100px] -z-10 group-hover:bg-accent-gold/20 transition-colors"></div>
              <div class="text-accent-gold text-xl mb-4">★★★★★</div>
              <p class="text-white italic mb-8 relative">
                <span class="text-4xl text-glass-border absolute -top-4 -left-2">"</span>
                La capacitación in-house para nuestro departamento de RRHH fue un éxito rotundo. Ahorramos miles de dólares previniendo contingencias laborales.
              </p>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-navy-dark border border-glass-border flex items-center justify-center text-white font-bold">MF</div>
                <div>
                  <div class="text-white font-bold text-sm">Mario Fernández</div>
                  <div class="text-text-secondary text-xs">CEO, Constructora Vértice</div>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-b from-white/5 to-transparent border border-glass-border p-8 rounded-2xl hover:-translate-y-3 transition-transform duration-300 relative group overflow-hidden md:-mt-8 md:mb-8">
              <div class="absolute top-0 right-0 w-32 h-32 bg-accent-gold/10 rounded-bl-[100px] -z-10 group-hover:bg-accent-gold/20 transition-colors"></div>
              <div class="text-accent-gold text-xl mb-4">★★★★★</div>
              <p class="text-white italic mb-8 relative">
                <span class="text-4xl text-glass-border absolute -top-4 -left-2">"</span>
                El curso de Finanzas Corporativas es el más práctico que he tomado. Carolina va directo a lo que realmente pasa en los tribunales y directorios.
              </p>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-navy-dark border border-glass-border flex items-center justify-center text-white font-bold">AL</div>
                <div>
                  <div class="text-white font-bold text-sm">Ana López</div>
                  <div class="text-text-secondary text-xs">Asesora Legal Independiente</div>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-b from-white/5 to-transparent border border-glass-border p-8 rounded-2xl hover:-translate-y-3 transition-transform duration-300 relative group overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-accent-gold/10 rounded-bl-[100px] -z-10 group-hover:bg-accent-gold/20 transition-colors"></div>
              <div class="text-accent-gold text-xl mb-4">★★★★★</div>
              <p class="text-white italic mb-8 relative">
                <span class="text-4xl text-glass-border absolute -top-4 -left-2">"</span>
                Compramos licencias para todo el equipo contable. La calidad del contenido y la facilidad de la plataforma Laboralize superó nuestras expectativas.
              </p>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-navy-dark border border-glass-border flex items-center justify-center text-white font-bold">DR</div>
                <div>
                  <div class="text-white font-bold text-sm">Diego Ramírez</div>
                  <div class="text-text-secondary text-xs">Gerente de Finanzas</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- TOP CURSOS -->
        <section class="mb-32">
          <div class="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
            <div>
              <h2 class="text-3xl md:text-4xl font-outfit font-bold mb-2">Capacitaciones Premium</h2>
              <p class="text-text-secondary">Empieza hoy mismo y estudia a tu propio ritmo.</p>
            </div>
            <button class="btn btn-outline hover:bg-white hover:text-navy-dark hover:border-white transition-colors" onclick="app.navigate('catalog')">Explorar catálogo</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${featured}
          </div>
        </section>

        <!-- MÓDULO B2B (EMPRESAS) -->
        <section class="mb-24 relative overflow-hidden rounded-3xl border border-glass-border shadow-2xl">
          <!-- Fondo interactivo -->
          <div class="absolute inset-0 bg-gradient-to-br from-navy-primary via-navy-dark to-black z-0"></div>
          <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay"></div>
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-gold to-transparent opacity-50"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-center p-8 md:p-16 gap-12">
            <div class="flex-1 text-center md:text-left">
              <div class="inline-block px-4 py-1 bg-white/10 border border-white/20 text-white rounded-full text-xs font-bold mb-6 uppercase tracking-widest backdrop-blur-sm">
                LABORALIZE PARA EMPRESAS
              </div>
              <h2 class="text-3xl md:text-5xl font-outfit font-bold text-white mb-6 leading-tight">
                Transforma el <span class="text-accent-gold">Potencial</span> de tu Equipo Legal
              </h2>
              <p class="text-text-secondary text-lg mb-8 leading-relaxed">
                Adquiere licencias corporativas o agenda una mentoría in-house con Carolina. Realizamos auditorías preventivas y capacitamos a tu directorio para mitigar riesgos fiscales y laborales.
              </p>
              <ul class="text-left text-white mb-10 flex flex-col gap-4">
                <li class="flex items-center gap-3"><span class="text-accent-gold text-xl">✓</span> Precios especiales por volumen de licencias</li>
                <li class="flex items-center gap-3"><span class="text-accent-gold text-xl">✓</span> Cursos a medida según el rubro de tu empresa</li>
                <li class="flex items-center gap-3"><span class="text-accent-gold text-xl">✓</span> Certificación directa de Carolina para tu equipo</li>
              </ul>
              <button class="btn btn-primary text-lg px-8 py-4 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]" onclick="app.showB2BModal()">
                Contactar a Ventas
              </button>
            </div>
            
            <div class="flex-1 w-full relative">
              <div class="absolute inset-0 bg-accent-gold/20 blur-[80px] rounded-full"></div>
              <div class="bg-black/40 border border-glass-border rounded-2xl p-6 backdrop-blur-md relative transform rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                <div class="flex items-center gap-4 border-b border-glass-border pb-4 mb-4">
                  <div class="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold">💼</div>
                  <div>
                    <div class="text-white font-bold">Mentoría Privada</div>
                    <div class="text-text-secondary text-xs">Agendamiento In-House</div>
                  </div>
                </div>
                <div class="flex items-center gap-4 border-b border-glass-border pb-4 mb-4">
                  <div class="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold">🏢</div>
                  <div>
                    <div class="text-white font-bold">Capacitación Masiva</div>
                    <div class="text-text-secondary text-xs">Licencias Corporativas</div>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold">🔍</div>
                  <div>
                    <div class="text-white font-bold">Auditoría Preventiva</div>
                    <div class="text-text-secondary text-xs">Diagnóstico Legal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        </div> <!-- end ed-container -->
      </div> <!-- end w-full wrapper -->
    `;
  },

  catalog: () => {
    const categories = ['Todos', ...new Set(window.db.courses.map(c => c.category))];
    const filtersHtml = categories.map(cat => `
      <button class="px-4 py-2 rounded-full border border-glass-border text-sm transition-colors ${app.currentFilter === cat ? 'bg-accent-gold text-black border-accent-gold font-bold' : 'text-text-secondary hover:text-white hover:border-white'}" onclick="app.setFilter('${cat}')">${cat}</button>
    `).join('');
    
    let filteredCourses = window.db.courses;
    if (app.currentFilter !== 'Todos') filteredCourses = filteredCourses.filter(c => c.category === app.currentFilter);

    const coursesHtml = filteredCourses.map(c => `
      <div class="card flex flex-col h-full" onclick="app.navigate('course', {id: ${c.id}})">
        <img src="${c.image}" class="w-full h-48 object-cover" alt="${c.title}">
        <div class="p-6 flex flex-col flex-grow">
          <div class="text-accent-gold text-xs font-bold uppercase tracking-wider mb-2">${c.category}</div>
          <div class="text-xl font-outfit font-bold mb-3 text-white">${c.title}</div>
          <div class="text-text-secondary text-sm mb-6 flex-grow">${c.description.substring(0, 100)}...</div>
          <div class="flex justify-between items-center mt-auto pt-4 border-t border-glass-border">
            <span class="font-bold text-lg text-white">S/ ${c.price.toFixed(2)}</span>
            <button class="btn btn-primary text-sm py-2 px-4">Ver Temario</button>
          </div>
        </div>
      </div>`).join('');

    return `
      <div class="ed-container mt-12">
        <div class="bg-glass-bg border border-glass-border p-8 md:p-16 rounded-2xl mb-12 text-center">
          <h1 class="font-outfit text-4xl md:text-5xl font-bold mb-4">Catálogo de Cursos</h1>
          <p class="text-text-secondary text-lg max-w-2xl mx-auto">Potencia tu carrera con conocimientos accionables de la mano de nuestra abogada experta, Carolina.</p>
        </div>
        <div class="flex flex-wrap gap-4 justify-center mb-12">${filtersHtml}</div>
        ${filteredCourses.length === 0 
          ? `<p class="text-center text-text-secondary mt-16 text-lg">No hay cursos en esta categoría.</p>` 
          : `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">${coursesHtml}</div>`}
      </div>
    `;
  },

  courseDetail: (id) => {
    const c = window.dbAPI.getCourse(id);
    const hasAccess = window.dbAPI.hasCourse(c.id);
    
    let actionButton = hasAccess 
      ? `<button class="btn btn-success w-full py-4 text-lg rounded-xl font-bold shadow-lg" onclick="app.navigate('player', {id: ${c.id}})">Ir a mis clases</button>`
      : `<button class="btn btn-primary w-full py-4 text-lg rounded-xl font-bold shadow-lg" onclick="app.showCheckoutModal(${c.id})">COMPRAR CURSO</button>`;

    const temarioHtml = c.modules.map(m => `
      <div class="border border-glass-border rounded-xl mb-4 overflow-hidden">
        <div class="bg-glass-bg p-4 flex justify-between items-center cursor-pointer select-none hover:bg-white/5 transition-colors" onclick="app.toggleAccordion(this)">
          <span class="font-bold text-white">${m.title}</span>
          <span class="acc-icon text-accent-gold text-2xl font-bold leading-none">-</span>
        </div>
        <div class="bg-navy-dark p-4 border-t border-glass-border">
          <ul class="flex flex-col gap-3">
            ${m.lessons.map(l => `
              <li class="flex justify-between items-center text-sm">
                <span class="text-white flex items-center gap-3"><span class="text-text-secondary text-xs">▶</span> ${l.title}</span>
                <span class="text-text-secondary">${l.duration}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>`).join('');

    const trailerBlockHtml = `
      <div class="relative rounded-xl overflow-hidden group cursor-pointer mb-6" onclick="app.playTrailer(${c.id})">
        <img src="${c.image}" class="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105" alt="Trailer">
        <div class="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
          <div class="bg-accent-gold text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 transform group-hover:scale-110 transition-transform shadow-lg">
            <span>▶</span> Ver Trailer
          </div>
        </div>
      </div>
    `;

    return `
      <div class="ed-container relative">
        <button class="btn btn-outline mt-8 mb-4 text-sm" onclick="app.navigate('catalog')">&larr; Volver al catálogo</button>
        <div class="flex flex-col lg:flex-row gap-10 mt-4 relative">
          
          <div class="flex-[2] pb-32 md:pb-24">
            
            <!-- Trailer Móvil (Solo visible en pantallas pequeñas, al tope) -->
            <div class="block lg:hidden w-full">
              ${trailerBlockHtml}
            </div>

            <div class="text-accent-gold text-sm font-bold uppercase tracking-wider mb-4">${c.category}</div>
            <h1 class="text-3xl md:text-5xl font-outfit font-bold mb-6 leading-tight">${c.title}</h1>
            <p class="text-lg text-text-secondary leading-relaxed mb-10">${c.description}</p>
            
            <div class="flex flex-wrap gap-8 mb-12 pb-8 border-b border-glass-border">
              <div><strong class="text-white block mb-1">👨‍🏫 Mentoría</strong><span class="text-text-secondary text-sm">Carolina (Abogada Experta)</span></div>
              <div><strong class="text-white block mb-1">⭐ Calificación</strong><span class="text-accent-gold">★★★★★</span> <span class="text-text-secondary text-sm">(4.9/5)</span></div>
              <div><strong class="text-white block mb-1">🏆 Certificado</strong><span class="text-text-secondary text-sm">Digital Avalado</span></div>
            </div>

            <div class="mb-12">
              <h2 class="text-2xl font-outfit font-bold mb-6">¿Qué aprenderás en este curso?</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-start gap-3"><span class="text-accent-gold font-bold">✓</span> <span class="text-text-secondary text-sm">Dominar los conceptos fundamentales y avanzados del área.</span></div>
                <div class="flex items-start gap-3"><span class="text-accent-gold font-bold">✓</span> <span class="text-text-secondary text-sm">Aplicar estrategias reales utilizadas por corporaciones.</span></div>
                <div class="flex items-start gap-3"><span class="text-accent-gold font-bold">✓</span> <span class="text-text-secondary text-sm">Evitar las contingencias legales más costosas del mercado.</span></div>
                <div class="flex items-start gap-3"><span class="text-accent-gold font-bold">✓</span> <span class="text-text-secondary text-sm">Optimizar procesos internos para tus clientes o estudio.</span></div>
              </div>
            </div>

            <h2 class="text-2xl font-outfit font-bold mb-6">Temario del Curso</h2>
            <div class="mb-16">${temarioHtml}</div>

            <div class="mb-16">
              <h2 class="text-2xl font-outfit font-bold mb-6">Conoce a tu Profesora</h2>
              <div class="flex flex-col md:flex-row gap-8 bg-glass-bg border border-glass-border rounded-xl p-8 items-center md:items-start">
                <img src="assets/carolina.jpg" class="w-32 h-32 rounded-full object-cover border-4 border-navy-dark shadow-xl" alt="Carolina">
                <div>
                  <h3 class="text-xl font-bold font-outfit text-white mb-2">Carolina</h3>
                  <p class="text-text-secondary text-sm leading-relaxed">Abogada y estratega corporativa con más de 10 años de experiencia asesorando a las firmas más grandes del país. Su metodología es 100% práctica, basada en casos reales de fiscalización y tribunales.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-outfit font-bold mb-6">Opiniones de Alumnos</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white/5 border border-glass-border rounded-xl p-6">
                  <div class="text-accent-gold text-lg mb-3">★★★★★</div>
                  <div class="text-text-secondary text-sm italic mb-4 leading-relaxed">"Increíble curso. Carolina explica los temas corporativos complejos con una facilidad brutal. Totalmente recomendado."</div>
                  <div class="text-white font-bold text-sm">- Carlos M., Abogado Senior</div>
                </div>
                <div class="bg-white/5 border border-glass-border rounded-xl p-6">
                  <div class="text-accent-gold text-lg mb-3">★★★★★</div>
                  <div class="text-text-secondary text-sm italic mb-4 leading-relaxed">"La inversión se pagó sola en el primer caso que apliqué lo aprendido. El material de apoyo es de primera calidad."</div>
                  <div class="text-white font-bold text-sm">- Andrea P., Asesora Legal</div>
                </div>
              </div>
            </div>

          </div>
          
          <div class="flex-1 w-full lg:w-auto relative hidden lg:block">
            <!-- Barra lateral Desktop (Oculta en móviles) -->
            <div class="bg-navy-dark border border-glass-border rounded-2xl p-6 sticky top-28 w-full z-10 shadow-2xl">
              ${trailerBlockHtml}
              
              <div class="text-4xl font-extrabold text-center mb-6 text-white tracking-tight">S/ ${c.price.toFixed(2)}</div>
              ${actionButton}
              
              <div class="mt-8 border-t border-glass-border pt-6 text-text-secondary text-sm flex flex-col gap-3">
                <div class="mb-2 text-white font-medium">Requisitos: Ningún conocimiento previo estrictamente necesario.</div>
                <div class="flex items-center gap-3"><span class="text-green-400 font-bold">✓</span> Acceso de por vida</div>
                <div class="flex items-center gap-3"><span class="text-green-400 font-bold">✓</span> Certificado digital al finalizar</div>
                <div class="flex items-center gap-3"><span class="text-green-400 font-bold">✓</span> Pago 100% seguro (MercadoPago)</div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <!-- Barra de Compra Fija Inferior (Móvil) -->
      <div class="fixed bottom-0 left-0 w-full bg-navy-dark p-4 border-t border-glass-border flex justify-between items-center z-[90] lg:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div class="text-2xl font-extrabold text-white">S/ ${c.price.toFixed(2)}</div>
        <div class="w-2/3">
          ${actionButton}
        </div>
      </div>
    `;
  },

  intranet: () => {
    const user = window.db.currentUser;
    const purchasedIds = user.purchasedCourses.map(id => Number(id));
    const completedIds = user.completedCourses ? user.completedCourses.map(id => Number(id)) : [];
    const purchasedCourses = window.db.courses.filter(c => purchasedIds.includes(Number(c.id)));

    let gridHtml = purchasedCourses.length === 0 ? `
      <div class="text-center p-16 bg-white/5 border border-dashed border-glass-border rounded-2xl">
        <h2 class="mb-6 text-text-secondary text-2xl font-outfit">Aún no tienes cursos</h2>
        <button class="btn btn-primary" onclick="app.navigate('catalog')">Explorar Cursos</button>
      </div>` : `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${purchasedCourses.map(c => {
          const isCompleted = completedIds.includes(Number(c.id));
          const progress = isCompleted ? 100 : 35;
          const statusText = isCompleted ? "100% Completado" : "35% Completado";
          const actionBtn = isCompleted 
            ? `<button class="btn btn-outline w-full border-accent-gold text-accent-gold font-bold hover:bg-accent-gold/10" onclick="app.navigate('page', {slug: 'certificados'})">🏆 Ver Certificado</button>`
            : `<button class="btn btn-success w-full font-bold" onclick="app.navigate('player', {id: ${c.id}})">▶ Continuar clase</button>`;
          
          return `
          <div class="card flex flex-col h-full">
            <img src="${c.image}" class="w-full h-40 object-cover cursor-pointer" alt="${c.title}" onclick="app.navigate('player', {id: ${c.id}})">
            <div class="p-6 flex flex-col flex-grow">
              <div class="font-outfit font-bold text-lg mb-4 text-white leading-tight">${c.title}</div>
              <div class="w-full bg-navy-dark h-2 rounded-full overflow-hidden mb-2">
                <div class="bg-accent-gold h-full rounded-full" style="width: ${progress}%;"></div>
              </div>
              <div class="text-xs text-text-secondary mb-6">${statusText}</div>
              <div class="mt-auto">${actionBtn}</div>
            </div>
          </div>
        `}).join('')}
      </div>`;

    return `
      <div class="ed-container mt-12">
        <div class="flex flex-col md:flex-row justify-between md:items-end border-b border-glass-border pb-8 mb-12 gap-6">
          <div>
            <h1 class="font-outfit text-4xl font-bold mb-2 text-white">Mi Aprendizaje</h1>
            <p class="text-text-secondary text-lg">Bienvenido de nuevo, <strong class="text-white">${user.name}</strong>. Es hora de continuar.</p>
          </div>
          <button class="btn btn-primary" onclick="app.navigate('page', {slug: 'certificados'})">🏆 Mis Certificados</button>
        </div>
        ${gridHtml}
      </div>
    `;
  },

  player: (id) => {
    const c = window.dbAPI.getCourse(id);
    const user = window.db.currentUser;
    const completedIds = user.completedCourses ? user.completedCourses.map(cid => Number(cid)) : [];
    const isCompleted = completedIds.includes(Number(c.id));

    const topButton = isCompleted 
      ? `<button class="btn btn-outline border-accent-gold text-accent-gold font-bold hover:bg-accent-gold/10" onclick="app.navigate('page', {slug: 'certificados'})">🏆 Ver Certificado</button>`
      : `<button class="btn btn-success font-bold" onclick="alert('Marcado como completado. ¡Progreso guardado!')">Siguiente Clase ▶</button>`;

    const playlistHtml = c.modules.map(m => `
      <div class="bg-black/40 px-6 py-4 font-bold text-sm text-text-secondary border-b border-glass-border">${m.title}</div>
      ${m.lessons.map((l, index) => `
        <div class="flex items-center gap-4 px-6 py-4 border-b border-glass-border cursor-pointer hover:bg-white/5 transition-colors ${index === 0 ? 'bg-white/10 border-l-2 border-l-accent-gold' : ''}">
          <div class="text-xs ${index === 0 ? 'text-accent-gold' : 'text-text-secondary'}">${index === 0 ? '▶' : '○'}</div>
          <div>
            <div class="text-sm ${index === 0 ? 'text-white font-bold' : 'text-text-secondary'}">${l.title}</div>
            <div class="text-xs text-text-secondary mt-1">${l.duration}</div>
          </div>
        </div>
      `).join('')}
    `).join('');

    return `
      <div class="w-[95%] max-w-[1600px] mx-auto mt-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-glass-bg border border-glass-border p-4 rounded-xl">
          <button class="btn btn-outline text-sm" onclick="app.navigate('intranet')">&larr; Volver</button>
          <h2 class="font-outfit font-bold text-xl md:text-2xl text-accent-gold text-center flex-1">${c.title}</h2>
          ${topButton}
        </div>

        <div class="flex flex-col lg:flex-row gap-6">
          <div class="flex-[3]">
            <video class="w-full aspect-video bg-black rounded-xl border border-glass-border object-cover shadow-2xl" controls autoplay>
              <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
              Tu navegador no soporta videos HTML5.
            </video>
          </div>
          
          <div class="flex-1 bg-navy-dark border border-glass-border rounded-xl flex flex-col overflow-hidden max-h-[calc(100vh-200px)] lg:max-h-none lg:h-[calc(100vw*9/16*0.75)]">
            <div class="p-6 bg-glass-bg border-b border-glass-border">
              <div class="font-bold text-white mb-4">Contenido del Curso</div>
              <div class="w-full bg-navy-primary h-2 rounded-full overflow-hidden mb-2">
                <div class="bg-accent-gold h-full rounded-full" style="width: 25%;"></div>
              </div>
              <div class="text-xs text-text-secondary">1 de 4 clases completadas</div>
            </div>
            <div class="overflow-y-auto flex-1 custom-scrollbar">
              ${playlistHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  page: (slug) => {
    if (slug === 'certificados') {
      const user = window.db.currentUser;
      if (!user) return `<div class="ed-container mt-16"><p class="text-center text-text-secondary">Inicia sesión primero.</p></div>`;
      
      const completedIds = user.completedCourses ? user.completedCourses.map(id => Number(id)) : [];
      if (completedIds.length === 0) {
        return `
          <div class="bg-glass-bg border-b border-glass-border py-12 mb-12 text-center">
            <h1 class="font-outfit text-4xl font-bold text-white">Mis Certificados</h1>
          </div>
          <div class="ed-container text-center pb-24">
            <p class="text-lg text-text-secondary mb-8">Aún no has completado ningún curso al 100%.</p>
            <button class="btn btn-outline" onclick="app.navigate('intranet')">&larr; Volver a Mis Cursos</button>
          </div>
        `;
      }
      
      const c = window.dbAPI.getCourse(completedIds[0]);

      return `
        <div class="bg-glass-bg border-b border-glass-border py-12 mb-12 text-center">
          <h1 class="font-outfit text-4xl font-bold text-white">Mis Certificados</h1>
        </div>
        <div class="ed-container text-center pb-24">
          <div class="flex justify-start mb-8">
            <button class="btn btn-outline" onclick="app.navigate('intranet')">&larr; Volver a Mis Cursos</button>
          </div>
          
          <div class="certificate-view mb-12 mx-auto max-w-5xl text-left bg-white text-black p-8 md:p-16 rounded-xl border-[10px] border-navy-primary shadow-2xl relative overflow-hidden">
            <div class="absolute inset-2 border-2 border-accent-gold pointer-events-none"></div>
            <div class="font-outfit text-3xl md:text-4xl font-extrabold text-navy-primary mb-12">Laboralize.</div>
            
            <div class="text-center">
              <div class="font-outfit text-3xl md:text-5xl text-accent-gold uppercase tracking-widest mb-4">Certificado de Finalización</div>
              <div class="text-lg text-gray-600 mb-8">Otorgado orgullosamente a</div>
              <div class="font-outfit text-4xl md:text-6xl font-bold text-navy-primary border-b-2 border-accent-gold inline-block pb-2 mb-8">${user.name}</div>
              <div class="text-gray-600 mb-6">Por haber aprobado y completado satisfactoriamente el curso premium:</div>
              <div class="font-outfit text-2xl md:text-3xl font-bold text-gray-800 mb-16">${c.title}</div>
              
              <div class="flex flex-col md:flex-row justify-around items-center gap-12 mt-16">
                <div class="text-center">
                  <div class="w-64 h-[2px] bg-navy-primary mx-auto mb-2"></div>
                  <div class="font-bold text-navy-primary text-lg">Firma Digital Verificada</div>
                  <div class="text-sm text-gray-500">ID: LBRZ-2026-X9Z8</div>
                </div>
                <div class="text-center">
                  <div class="w-64 h-[2px] bg-navy-primary mx-auto mb-2"></div>
                  <div class="font-bold text-navy-primary text-lg">Carolina</div>
                  <div class="text-sm text-gray-500">Abogada & Directora</div>
                </div>
              </div>
            </div>
          </div>
          
          <button class="btn btn-primary text-lg px-8 py-4" onclick="alert('Descargando PDF...')">📥 Descargar Certificado en PDF</button>
        </div>
      `;
    }

    const titles = { 'terminos': 'Términos y Condiciones', 'privacidad': 'Políticas de Privacidad', 'ayuda': 'Centro de Ayuda' };
    const title = titles[slug] || 'Página de Información';

    return `
      <div class="bg-glass-bg border-b border-glass-border py-12 mb-12 text-center">
        <h1 class="font-outfit text-4xl font-bold text-white">${title}</h1>
      </div>
      <div class="ed-container max-w-4xl pb-24 text-text-secondary leading-relaxed">
        <h2 class="text-2xl font-outfit font-bold text-white mb-4">1. Introducción</h2>
        <p class="mb-8">Bienvenido a la plataforma oficial de Laboralize. Al utilizar nuestros servicios de educación corporativa (la "Plataforma"), usted acepta estar sujeto a las siguientes estipulaciones (las "Condiciones"). Lea detenidamente estas Condiciones antes de acceder o utilizar los cursos dictados por nuestra instructora Carolina u otros mentores.</p>
        
        <h2 class="text-2xl font-outfit font-bold text-white mb-4">2. Derechos de Propiedad Intelectual</h2>
        <p class="mb-12">Todo el contenido audiovisual, metodologías, descargables y bases de datos alojados en este sitio web son propiedad exclusiva de Laboralize EIRL. Queda terminantemente prohibida la distribución, reventa o ingeniería inversa del material sin previo consentimiento escrito.</p>

        <button class="btn btn-outline" onclick="app.navigate('home')">&larr; Volver al Inicio</button>
      </div>
    `;
  }
};

window.addEventListener('DOMContentLoaded', () => { app.navigate('home'); });
