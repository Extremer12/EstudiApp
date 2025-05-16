// Configuración de Firebase
// Cambia las importaciones para usar CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBlYJCrZMkdAkTTuZ0OdVKrVyXF3BWSk5g",
    authDomain: "estudiapp-c4fbb.firebaseapp.com",
    projectId: "estudiapp-c4fbb",
    storageBucket: "estudiapp-c4fbb.firebasestorage.app",
    messagingSenderId: "909057797802",
    appId: "1:909057797802:web:c3481546f7137968fc2ad3",
    measurementId: "G-H47990FR2L"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Estado de autenticación
let currentUser = null;

// Observador de estado de autenticación
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  // Actualizar UI basado en estado de autenticación
  const userMenu = document.getElementById('user-menu');
  if (userMenu) {
    if (user) {
      userMenu.innerHTML = `<i class="fas fa-user-check"></i>`;
      userMenu.setAttribute('title', `Conectado como: ${user.email}`);
    } else {
      userMenu.innerHTML = `<i class="fas fa-user"></i>`;
      userMenu.setAttribute('title', 'Iniciar sesión');
    }
  }
});

// Funciones de autenticación
export async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Funciones de Firestore para tareas
export async function saveTasks(task) {
  if (!currentUser) return { success: false, error: "Usuario no autenticado" };
  
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      ...task,
      userId: currentUser.uid,
      createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error al guardar tarea:", error);
    return { success: false, error: error.message };
  }
}

export async function getTasks() {
  if (!currentUser) return { success: false, error: "Usuario no autenticado" };
  
  try {
    const q = query(collection(db, "tasks"), where("userId", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, tasks };
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTask(taskId, taskData) {
  if (!currentUser) return { success: false, error: "Usuario no autenticado" };
  
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, taskData);
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    return { success: false, error: error.message };
  }
}

export async function removeTask(taskId) {
  if (!currentUser) return { success: false, error: "Usuario no autenticado" };
  
  try {
    await deleteDoc(doc(db, "tasks", taskId));
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    return { success: false, error: error.message };
  }
}

// Funciones para materias
export async function saveSubject(subject) {
  if (!currentUser) return { success: false, error: "Usuario no autenticado" };
  
  try {
    const docRef = await addDoc(collection(db, "subjects"), {
      ...subject,
      userId: currentUser.uid,
      createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error al guardar materia:", error);
    return { success: false, error: error.message };
  }
}

export async function getSubjects() {
  if (!currentUser) return { success: false, error: "Usuario no autenticado" };
  
  try {
    const q = query(collection(db, "subjects"), where("userId", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    const subjects = [];
    querySnapshot.forEach((doc) => {
      subjects.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, subjects };
  } catch (error) {
    console.error("Error al obtener materias:", error);
    return { success: false, error: error.message };
  }
}

// Funciones para exámenes
export async function saveExam(exam) {
  if (!currentUser) return { success: false, error: "Usuario no autenticado" };
  
  try {
    const docRef = await addDoc(collection(db, "exams"), {
      ...exam,
      userId: currentUser.uid,
      createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error al guardar examen:", error);
    return { success: false, error: error.message };
  }
}

export async function getExams() {
  if (!currentUser) return { success: false, error: "Usuario no autenticado" };
  
  try {
    const q = query(collection(db, "exams"), where("userId", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    const exams = [];
    querySnapshot.forEach((doc) => {
      exams.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, exams };
  } catch (error) {
    console.error("Error al obtener exámenes:", error);
    return { success: false, error: error.message };
  }
}

export { db, auth, currentUser };