// SPA Router and Views V5 (Ed.team Scale, Strict Grids, Mock Video & Certificates)

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
        <span style="color: var(--text-secondary); margin-right: 1rem; font-weight: bold;">Hola, ${window.db.currentUser.name.split(' ')[0]}</span>
        <button class="btn btn-outline" onclick="app.navigate('intranet'); app.closeMobileMenu();">Intranet</button>
        <button class="btn btn-outline" style="border-color: #ef4444; color: #ef4444;" onclick="app.logout(); app.closeMobileMenu();">Salir</button>
      `;
      container.innerHTML = authHtml;
      mobileContainer.innerHTML = `<div style="display:flex; flex-direction:column; gap:1rem;">${authHtml}</div>`;
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
    const container = document.getElementById('trailer-container');
    // V6: Real HTML5 Video with reliable MDN source
    container.innerHTML = `
      <video class="mock-player" controls autoplay style="width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 12px; border: 1px solid var(--glass-border); object-fit: cover;">
        <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
        Tu navegador no soporta videos HTML5.
      </video>`;
  },

  showModal: (htmlContent) => {
    document.getElementById('modal-content').innerHTML = htmlContent;
    document.getElementById('modal-container').classList.remove('hidden');
  },
  closeModal: () => { document.getElementById('modal-container').classList.add('hidden'); },

  showLoginModal: () => {
    const html = `
      <span class="close-btn" onclick="app.closeModal()">&times;</span>
      <h2 style="margin-bottom: 2rem; color: var(--accent-gold); font-family: 'Outfit';">Iniciar Sesión</h2>
      <p style="margin-bottom: 1.5rem; color: var(--text-secondary); font-size: 0.9rem;">
        Para testing, usa <strong>alumno@laboralize.pe</strong> y contraseña <strong>123</strong>
      </p>
      <div class="form-group"><label>Correo Electrónico</label><input type="email" id="login-email" value="alumno@laboralize.pe"></div>
      <div class="form-group"><label>Contraseña</label><input type="password" id="login-password" value="123"></div>
      <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="app.doLogin()">Ingresar</button>
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
      <span class="close-btn" onclick="app.closeModal()">&times;</span>
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <span style="color: #009ee3; font-weight: bold; font-size: 1.5rem;">MercadoPago</span>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">Entorno de Simulación</div>
      </div>
      <h3 style="margin-bottom: 1rem;">Finalizar Compra</h3>
      <p style="color: var(--text-secondary); margin-bottom: 2rem;">Estás comprando: <strong>${course.title}</strong></p>
      <div style="background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
        <span>Total a pagar:</span><span style="font-size: 1.8rem; font-weight: bold; color: var(--accent-gold);">S/ ${course.price.toFixed(2)}</span>
      </div>
      <div class="form-group"><label>Número de Tarjeta (Simulado)</label><input type="text" value="4555 5555 5555 5555"></div>
      <button class="btn btn-success" style="width: 100%; margin-top: 1rem; padding: 1rem; font-size: 1.1rem; text-transform: uppercase;" onclick="app.doPurchase(${course.id})">
        Pagar y Desbloquear Curso
      </button>
    `;
    app.showModal(html);
  },

  doPurchase: (courseId) => {
    window.dbAPI.buyCourse(courseId); app.closeModal();
    setTimeout(() => { alert('¡Pago Exitoso por MercadoPago! Tu curso se ha desbloqueado.'); app.navigate('intranet'); }, 400);
  },

  toggleAccordion: (element) => { element.nextElementSibling.classList.toggle('open'); }
};

const views = {
  home: () => {
    const featured = window.db.courses.slice(0,3).map(c => `
      <div class="card" onclick="app.navigate('course', {id: ${c.id}})">
        <img src="${c.image}" class="card-img" alt="${c.title}">
        <div class="card-content">
          <div class="card-category">${c.category}</div>
          <div class="card-title">${c.title}</div>
          <div class="card-desc">${c.description.substring(0, 80)}...</div>
          <div class="card-footer">
            <span class="card-price">S/ ${c.price.toFixed(2)}</span>
            <span style="color: var(--accent-gold); font-weight: bold;">Ver detalles &rarr;</span>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="ed-container">
        <section class="hero">
          <div style="display: inline-block; padding: 0.5rem 1rem; background: rgba(255,215,0,0.1); border: 1px solid var(--accent-gold); color: var(--accent-gold); border-radius: 20px; font-size: 0.9rem; font-weight: bold; margin-bottom: 1.5rem;">
            LA PLATAFORMA #1 PARA ABOGADOS
          </div>
          <h1>Domina el Derecho Corporativo <br>y las Finanzas</h1>
          <p>Aprende con Carolina, experta legal, a tu propio ritmo. Accede a contenido premium diseñado exclusivamente para profesionales que buscan escalar al siguiente nivel en el mercado latinoamericano.</p>
          <button class="btn btn-primary" style="font-size: 1.2rem; padding: 1.2rem 3rem;" onclick="app.navigate('catalog')">Comenzar a Aprender</button>
        </section>

        <section class="trust-grid">
          <span style="font-size: 2rem; font-family: 'Outfit'; font-weight: 800; color: #fff;">ESTUDIO GÁLVEZ</span>
          <span style="font-size: 2rem; font-family: 'Outfit'; font-weight: 800; color: #fff;">CORP L&F</span>
          <span style="font-size: 2rem; font-family: 'Outfit'; font-weight: 800; color: #fff;">TECH LEGAL</span>
          <span style="font-size: 2rem; font-family: 'Outfit'; font-weight: 800; color: #fff;">LEX GROUP</span>
        </section>

        <section class="stats-grid">
          <div><div class="stat-num">5,000+</div><div class="stat-label">Alumnos Activos</div></div>
          <div><div class="stat-num">150+</div><div class="stat-label">Horas de Contenido</div></div>
          <div><div class="stat-num">98%</div><div class="stat-label">Satisfacción (5 Estrellas)</div></div>
          <div><div class="stat-num">24/7</div><div class="stat-label">Acceso de por vida</div></div>
        </section>

        <section>
          <h2 class="section-title text-center" style="text-align: center;">Por qué elegir Laboralize</h2>
          <div class="path-grid">
            <div class="path-card"><div style="font-size: 3rem; margin-bottom: 1rem;">👩‍⚖️</div><h3>Experta Real</h3><p style="color: var(--text-secondary);">Aprende directamente de Carolina, abogada experta con casos reales en el entorno corporativo y tributario.</p></div>
            <div class="path-card"><div style="font-size: 3rem; margin-bottom: 1rem;">📱</div><h3>Estudia Donde Sea</h3><p style="color: var(--text-secondary);">Plataforma ultra rápida. Reproductor que guarda tu progreso. Estudia desde el móvil camino a la oficina.</p></div>
            <div class="path-card"><div style="font-size: 3rem; margin-bottom: 1rem;">📜</div><h3>Certificados Digitales</h3><p style="color: var(--text-secondary);">Respalda tu conocimiento. Descarga certificados con código QR verificable para potenciar tu perfil de LinkedIn.</p></div>
          </div>
        </section>
        
        <section style="margin-bottom: 4rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <h2 class="section-title" style="margin-top: 0;">Nuestras Capacitaciones Top</h2>
            <button class="btn btn-outline" style="margin-bottom: 2rem;" onclick="app.navigate('catalog')">Ver todas</button>
          </div>
          <div class="course-grid">
            ${featured}
          </div>
        </section>
      </div>
    `;
  },

  catalog: () => {
    const categories = ['Todos', ...new Set(window.db.courses.map(c => c.category))];
    const filtersHtml = categories.map(cat => `<button class="filter-btn ${app.currentFilter === cat ? 'active' : ''}" onclick="app.setFilter('${cat}')">${cat}</button>`).join('');
    
    let filteredCourses = window.db.courses;
    if (app.currentFilter !== 'Todos') filteredCourses = filteredCourses.filter(c => c.category === app.currentFilter);

    const coursesHtml = filteredCourses.map(c => `
      <div class="card" onclick="app.navigate('course', {id: ${c.id}})">
        <img src="${c.image}" class="card-img" alt="${c.title}">
        <div class="card-content">
          <div class="card-category">${c.category}</div>
          <div class="card-title">${c.title}</div>
          <div class="card-desc">${c.description}</div>
          <div class="card-footer"><span class="card-price">S/ ${c.price.toFixed(2)}</span><button class="btn btn-primary" style="padding: 0.5rem 1rem;">Ver Temario</button></div>
        </div>
      </div>`).join('');

    return `
      <div class="ed-container" style="margin-top: 3rem;">
        <div style="background: rgba(0,0,0,0.2); padding: 4rem; border-radius: 16px; border: 1px solid var(--glass-border); margin-bottom: 3rem; text-align: center;">
          <h1 style="font-family: 'Outfit'; font-size: 3.5rem; margin-bottom: 1rem;">Catálogo de Cursos</h1>
          <p style="color: var(--text-secondary); font-size: 1.2rem; max-width: 600px; margin: 0 auto;">Potencia tu carrera con conocimientos accionables de la mano de nuestra abogada experta, Carolina.</p>
        </div>
        <div class="filter-container">${filtersHtml}</div>
        ${filteredCourses.length === 0 ? `<p style="text-align:center; color: var(--text-secondary); margin-top: 4rem;">No hay cursos en esta categoría.</p>` : `<div class="course-grid">${coursesHtml}</div>`}
      </div>
    `;
  },

  courseDetail: (id) => {
    const c = window.dbAPI.getCourse(id);
    const hasAccess = window.dbAPI.hasCourse(c.id);
    
    let actionButton = hasAccess 
      ? `<button class="btn btn-success" style="width: 100%; padding: 1.2rem; font-size: 1.1rem; border-radius: 12px; font-weight:bold;" onclick="app.navigate('player', {id: ${c.id}})">Ir a mis clases</button>`
      : `<button class="btn btn-primary" style="width: 100%; padding: 1.2rem; font-size: 1.1rem; border-radius: 12px; font-weight: bold;" onclick="app.showCheckoutModal(${c.id})">COMPRAR CURSO</button>`;

    const temarioHtml = c.modules.map(m => `
      <div class="accordion-item">
        <div class="accordion-header" onclick="app.toggleAccordion(this)">
          <span>${m.title}</span><span style="color: var(--accent-gold); font-size: 1.5rem;">+</span>
        </div>
        <div class="accordion-content open">
          <ul>${m.lessons.map(l => `<li><div style="display: flex; justify-content: space-between; width: 100%;"><span><span style="color: var(--text-secondary); margin-right: 10px;">▶</span> ${l.title}</span><span style="color: var(--text-secondary);">${l.duration}</span></div></li>`).join('')}</ul>
        </div>
      </div>`).join('');

    return `
      <div class="ed-container">
        <button class="btn btn-outline" style="margin-top: 3rem; margin-bottom: 1rem; padding: 0.5rem 1rem;" onclick="app.navigate('catalog')">&larr; Volver al catálogo</button>
        <div class="detail-header">
          <div class="detail-info">
            <div class="card-category" style="margin-bottom: 1rem; font-size: 1rem;">${c.category}</div>
            <h1>${c.title}</h1>
            <p style="font-size: 1.2rem; color: var(--text-secondary); line-height: 1.8; margin-bottom: 2rem;">${c.description}</p>
            
            <div style="display: flex; gap: 3rem; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid var(--glass-border); flex-wrap: wrap;">
              <div><strong style="color: #fff; font-size: 1.2rem;">👨‍🏫 Mentoría</strong><br><span style="color: var(--text-secondary);">Carolina (Abogada Experta)</span></div>
              <div><strong style="color: #fff; font-size: 1.2rem;">⭐ Calificación</strong><br><span class="stars">★★★★★</span> <span style="color: var(--text-secondary);">(4.9/5)</span></div>
              <div><strong style="color: #fff; font-size: 1.2rem;">🏆 Certificado</strong><br><span style="color: var(--text-secondary);">Digital Avalado</span></div>
            </div>

            <div class="tab-section" style="margin-top: 0; padding-top: 0; border: none;">
              <h2>¿Qué aprenderás en este curso?</h2>
              <div class="learn-grid" style="margin-bottom: 3rem;">
                <div class="learn-item"><span>✓</span> Dominar los conceptos fundamentales y avanzados del área.</div>
                <div class="learn-item"><span>✓</span> Aplicar estrategias reales utilizadas por corporaciones.</div>
                <div class="learn-item"><span>✓</span> Evitar las contingencias legales más costosas del mercado.</div>
                <div class="learn-item"><span>✓</span> Optimizar procesos internos para tus clientes o estudio.</div>
              </div>
            </div>

            <h2 style="margin-bottom: 1.5rem; font-family: 'Outfit';">Temario del Curso</h2>
            <div class="accordion" style="margin-bottom: 4rem;">${temarioHtml}</div>

            <div class="tab-section">
              <h2>Conoce a tu Profesora</h2>
              <div class="instructor-card">
                <!-- Instructor Image loaded explicitly from Carolina's photo -->
                <img src="assets/carolina.jpg" class="instructor-img" alt="Carolina">
                <div class="instructor-info">
                  <h3>Carolina</h3>
                  <p>Abogada y estratega corporativa con más de 10 años de experiencia asesorando a las firmas más grandes del país. Su metodología es 100% práctica, basada en casos reales de fiscalización y tribunales.</p>
                </div>
              </div>
            </div>

            <div class="tab-section">
              <h2>Opiniones de Alumnos</h2>
              <div class="reviews-grid">
                <div class="review-card">
                  <div class="stars">★★★★★</div>
                  <div class="review-text">"Increíble curso. Carolina explica los temas corporativos complejos con una facilidad brutal. Totalmente recomendado."</div>
                  <div class="review-author">- Carlos M., Abogado Senior</div>
                </div>
                <div class="review-card">
                  <div class="stars">★★★★★</div>
                  <div class="review-text">"La inversión se pagó sola en el primer caso que apliqué lo aprendido. El material de apoyo es de primera calidad."</div>
                  <div class="review-author">- Andrea P., Asesora Legal</div>
                </div>
              </div>
            </div>

          </div>
          
          <div class="detail-sidebar">
            <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.5rem; position: sticky; top: 120px;">
              <div id="trailer-container">
                <div class="video-placeholder" onclick="app.playTrailer(${c.id})">
                  <img src="${c.image}" alt="Trailer">
                  <div class="play-btn">▶ Ver Trailer</div>
                </div>
              </div>
              <div class="price" style="font-size: 2.5rem; font-weight: 800; text-align: center; margin-bottom: 1.5rem; color: #fff;">S/ ${c.price.toFixed(2)}</div>
              ${actionButton}
              
              <div style="margin-top: 1.5rem; border-top: 1px solid var(--glass-border); padding-top: 1rem; color: var(--text-secondary); line-height: 1.8;">
                <div style="margin-bottom: 0.5rem;">Requisitos: Ningún conocimiento previo estrictamente necesario. Pasión por aprender.</div>
                <div style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--success-color);">✓</span> Acceso de por vida</div>
                <div style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--success-color);">✓</span> Certificado digital al finalizar</div>
                <div style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--success-color);">✓</span> Pago 100% seguro (MercadoPago)</div>
              </div>
            </div>
          </div>
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
      <div style="text-align: center; padding: 4rem; background: rgba(255,255,255,0.02); border: 1px dashed var(--glass-border); border-radius: 16px;">
        <h2 style="margin-bottom: 1rem; color: var(--text-secondary);">Aún no tienes cursos</h2>
        <button class="btn btn-primary" onclick="app.navigate('catalog')">Explorar Cursos</button>
      </div>` : `
      <div class="course-grid">
        ${purchasedCourses.map(c => {
          const isCompleted = completedIds.includes(Number(c.id));
          const progress = isCompleted ? 100 : 35;
          const statusText = isCompleted ? "100% Completado" : "35% Completado";
          const actionBtn = isCompleted 
            ? `<button class="btn btn-outline" style="width: 100%; border-color: var(--accent-gold); color: var(--accent-gold); font-weight: bold; padding: 0.8rem;" onclick="app.navigate('page', {slug: 'certificados'})">🏆 Ver Certificado</button>`
            : `<button class="btn btn-success" style="width: 100%; font-weight: bold; padding: 0.8rem;" onclick="app.navigate('player', {id: ${c.id}})">▶ Continuar clase</button>`;
          
          return `
          <div class="card">
            <img src="${c.image}" class="card-img" alt="${c.title}" style="height: 160px; cursor: pointer;" onclick="app.navigate('player', {id: ${c.id}})">
            <div class="card-content">
              <div class="card-title" style="font-size: 1.2rem; line-height: 1.2;">${c.title}</div>
              <div class="progress-container"><div class="progress-bar" style="width: ${progress}%;"></div></div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; margin-bottom: 1.5rem;">${statusText}</div>
              ${actionBtn}
            </div>
          </div>
        `}).join('')}
      </div>`;

    return `
      <div class="ed-container" style="margin-top: 3rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid var(--glass-border); padding-bottom: 1.5rem; margin-bottom: 3rem; flex-wrap: wrap; gap: 2rem;">
          <div>
            <h1 style="font-family: 'Outfit'; font-size: 3rem;">Mi Aprendizaje</h1>
            <p style="color: var(--text-secondary); margin-top: 0.5rem; font-size: 1.1rem;">Bienvenido de nuevo, <strong>${user.name}</strong>. Es hora de continuar.</p>
          </div>
          <div><button class="btn btn-primary" onclick="app.navigate('page', {slug: 'certificados'})">🏆 Mis Certificados</button></div>
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
      ? `<button class="btn btn-outline" style="border-color: var(--accent-gold); color: var(--accent-gold); font-weight: bold;" onclick="app.navigate('page', {slug: 'certificados'})">🏆 Ver Certificado</button>`
      : `<button class="btn btn-success" style="font-weight: bold;" onclick="alert('Marcado como completado. ¡Progreso guardado!')">Siguiente Clase ▶</button>`;

    const playlistHtml = c.modules.map(m => `
      <div style="background: rgba(0,0,0,0.4); padding: 1rem 1.5rem; font-weight: bold; font-size: 0.95rem; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border);">${m.title}</div>
      ${m.lessons.map((l, index) => `
        <div class="lesson-item ${index === 0 ? 'active' : ''}">
          <div class="lesson-icon">${index === 0 ? '▶' : '○'}</div>
          <div style="flex: 1;">
            <div style="font-size: 0.95rem; color: ${index === 0 ? '#fff' : 'var(--text-secondary)'};">${l.title}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">${l.duration}</div>
          </div>
        </div>
      `).join('')}
    `).join('');

    return `
      <div class="ed-container" style="max-width: 1600px; margin-top: 3rem;">
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <button class="btn btn-outline" onclick="app.navigate('intranet')" style="padding: 0.5rem 1rem;">&larr; Volver a Mis Cursos</button>
          <h2 style="font-family: 'Outfit'; flex: 1; text-align: center; color: var(--accent-gold); min-width: 300px;">${c.title}</h2>
          ${topButton}
        </div>

        <div class="player-container">
          <div class="video-wrapper">
            <video class="mock-player" controls autoplay style="width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 12px; border: 1px solid var(--glass-border); object-fit: cover;">
              <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
              Tu navegador no soporta videos HTML5.
            </video>
          </div>
          
          <div class="playlist">
            <div class="playlist-header">
              <div>Contenido del Curso</div>
              <div class="progress-container"><div class="progress-bar" style="width: 25%;"></div></div>
              <div style="font-size: 0.8rem; font-weight: normal; color: var(--text-secondary); margin-top: 0.5rem;">1 de 4 clases completadas</div>
            </div>
            <div style="flex: 1; overflow-y: auto;">${playlistHtml}</div>
          </div>
        </div>
      </div>
    `;
  },

  page: (slug) => {
    // V5: If slug is certificados, show the dynamic certificate view
    if (slug === 'certificados') {
      const user = window.db.currentUser;
      if (!user) return `<div class="ed-container" style="margin-top:4rem;"><p>Inicia sesión primero.</p></div>`;
      
      const completedIds = user.completedCourses ? user.completedCourses.map(id => Number(id)) : [];
      if (completedIds.length === 0) {
        return `
          <div class="page-header"><h1>Mis Certificados</h1></div>
          <div class="ed-container" style="text-align:center;">
            <p style="font-size:1.2rem; color:var(--text-secondary); margin-bottom:2rem;">Aún no has completado ningún curso al 100%.</p>
            <button class="btn btn-outline" onclick="app.navigate('intranet')">&larr; Volver a Mis Cursos</button>
          </div>
        `;
      }
      
      const c = window.dbAPI.getCourse(completedIds[0]); // Mostrar el primero completado

      return `
        <div class="page-header">
          <h1>Mis Certificados</h1>
        </div>
        <div class="ed-container" style="text-align:center;">
          <button class="btn btn-outline" style="margin-bottom: 2rem;" onclick="app.navigate('intranet')">&larr; Volver a Mis Cursos</button>
          
          <div class="certificate-view">
            <div class="cert-logo">Laboralize.</div>
            <div class="cert-title">Certificado de Finalización</div>
            <div class="cert-subtitle">Otorgado orgullosamente a</div>
            <div class="cert-name">${user.name}</div>
            <div class="cert-subtitle">Por haber aprobado y completado satisfactoriamente el curso premium:</div>
            <div class="cert-course">${c.title}</div>
            
            <div class="cert-signatures">
              <div class="cert-sign">Firma Digital Verificada<br><span style="font-size:0.8rem; color:#888;">ID: LBRZ-2026-X9Z8</span></div>
              <div class="cert-sign">Carolina<br><span style="font-size:0.8rem; color:#888;">Abogada & Directora</span></div>
            </div>
          </div>
          
          <button class="btn btn-primary" style="margin-bottom: 4rem;" onclick="alert('Descargando PDF...')">📥 Descargar Certificado en PDF</button>
        </div>
      `;
    }

    // Default mock pages
    const titles = {
      'terminos': 'Términos y Condiciones',
      'privacidad': 'Políticas de Privacidad',
      'ayuda': 'Centro de Ayuda'
    };
    const title = titles[slug] || 'Página de Información';

    return `
      <div class="page-header">
        <h1>${title}</h1>
      </div>
      <div class="ed-container">
        <div class="page-content">
          <h2>1. Introducción</h2>
          <p>Bienvenido a la plataforma oficial de Laboralize. Al utilizar nuestros servicios de educación corporativa (la "Plataforma"), usted acepta estar sujeto a las siguientes estipulaciones (las "Condiciones"). Lea detenidamente estas Condiciones antes de acceder o utilizar los cursos dictados por nuestra instructora Carolina u otros mentores.</p>
          
          <h2>2. Derechos de Propiedad Intelectual</h2>
          <p>Todo el contenido audiovisual, metodologías, descargables y bases de datos alojados en este sitio web son propiedad exclusiva de Laboralize EIRL. Queda terminantemente prohibida la distribución, reventa o ingeniería inversa del material sin previo consentimiento escrito.</p>

          <br><br>
          <button class="btn btn-outline" onclick="app.navigate('home')">&larr; Volver al Inicio</button>
        </div>
      </div>
    `;
  }
};

window.addEventListener('DOMContentLoaded', () => { app.navigate('home'); });
