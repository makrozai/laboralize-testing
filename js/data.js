// Laboralize Mock DB

window.db = {
  users: [
    {
      id: 1,
      name: "Alumno Prueba",
      email: "alumno@laboralize.pe",
      password: "123", // very simple for mockup
      purchasedCourses: [1, 2], // owns course ID 2 by default
      completedCourses: [2] // Course 2 is completed
    }
  ],
  
  courses: [
    {
      id: 1,
      title: "Derecho Laboral Empresarial",
      category: "Legal",
      price: 250.00,
      image: "assets/curso_laboral_v4.jpg",
      description: "Aprende a estructurar contratos laborales, gestionar despidos y evitar multas de SUNAFIL con casos 100% reales.",
      trailerUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 
      modules: [
        {
          title: "Módulo 1: Contratación",
          lessons: [
            { id: 101, title: "Tipos de contratos", duration: "15:00", video: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
            { id: 102, title: "Periodo de prueba", duration: "12:30", video: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
          ]
        },
        {
          title: "Módulo 2: Fiscalización SUNAFIL",
          lessons: [
            { id: 103, title: "Cómo afrontar una inspección", duration: "20:00", video: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Finanzas Básicas para Abogados",
      category: "Finanzas",
      price: 180.00,
      image: "assets/curso_finanzas_v4.jpg",
      description: "Entiende los balances financieros, flujo de caja y rentabilidad de estudios jurídicos sin ser contador.",
      trailerUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      modules: [
        {
          title: "Módulo 1: Fundamentos",
          lessons: [
            { id: 201, title: "Leer un Estado de Resultados", duration: "18:20", video: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Tributación Práctica Empresarial",
      category: "Legal & Finanzas",
      price: 320.00,
      image: "assets/curso_tributacion_v5.jpg",
      description: "Estrategias de planeamiento tributario para reducir el pago de impuestos de forma 100% legal (Escudo Fiscal).",
      trailerUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      modules: [
        {
          title: "Módulo 1: Planeamiento",
          lessons: [
            { id: 301, title: "El Escudo Fiscal", duration: "25:00", video: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
            { id: 302, title: "Gastos deducibles", duration: "22:15", video: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
          ]
        }
      ]
    }
  ],

  // State of the app
  currentUser: null
};

// Utils
window.dbAPI = {
  login: (email, password) => {
    const user = window.db.users.find(u => u.email === email && u.password === password);
    if (user) {
      window.db.currentUser = user;
      return true;
    }
    return false;
  },
  logout: () => {
    window.db.currentUser = null;
  },
  getCourse: (id) => {
    return window.db.courses.find(c => c.id == id);
  },
  buyCourse: (courseId) => {
    if (window.db.currentUser) {
      if (!window.db.currentUser.purchasedCourses.includes(courseId)) {
        window.db.currentUser.purchasedCourses.push(parseInt(courseId));
      }
    }
  },
  hasCourse: (courseId) => {
    if (!window.db.currentUser) return false;
    return window.db.currentUser.purchasedCourses.includes(parseInt(courseId));
  }
};
