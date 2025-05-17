// Funcionalidad de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

// Configuración de Firebase
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
const auth = getAuth(app);
const db = getFirestore(app);

// Variable para almacenar el usuario actual
let currentUser = null;

// Actualizar el usuario actual cuando cambia el estado de autenticación
auth.onAuthStateChanged((user) => {
    currentUser = user;
});

// Función para obtener el usuario actual
export function getCurrentUser() {
    return currentUser;
}

// Funciones de autenticación
export async function registerUser(email, password) {
    try {
        // Verificar si estamos en desarrollo local
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
            console.log("Modo de desarrollo local: simulando registro de usuario");
            // Simular un registro exitoso en desarrollo local
            currentUser = { 
                uid: 'local-user-' + Date.now(),
                email: email,
                displayName: email.split('@')[0]
            };
            return { 
                success: true, 
                user: currentUser
            };
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        let errorMessage = "Error al crear la cuenta";
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "Este correo electrónico ya está en uso";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Correo electrónico inválido";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "La contraseña es demasiado débil";
        }
        
        return { success: false, error: errorMessage };
    }
}

export async function loginUser(email, password) {
    try {
        // Verificar si estamos en desarrollo local
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
            console.log("Modo de desarrollo local: simulando inicio de sesión");
            // Simular un inicio de sesión exitoso en desarrollo local
            currentUser = { 
                uid: 'local-user-' + Date.now(),
                email: email,
                displayName: email.split('@')[0]
            };
            return { success: true, user: currentUser };
        }
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        let errorMessage = "Error al iniciar sesión";
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = "Correo electrónico o contraseña incorrectos";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Correo electrónico inválido";
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = "Esta cuenta ha sido deshabilitada";
        }
        
        return { success: false, error: errorMessage };
    }
}

export async function logoutUser() {
    try {
        // Si estamos en desarrollo local
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
            console.log("Modo de desarrollo local: simulando cierre de sesión");
            currentUser = null;
            return { success: true };
        }
        
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        return { success: false, error: "Error al cerrar sesión" };
    }
}

// Funciones para tareas
async function getTasks() {
    try {
        if (!currentUser) {
            return { success: false, error: "Usuario no autenticado" };
        }
        
        const tasksQuery = query(collection(db, "tasks"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(tasksQuery);
        
        const tasks = [];
        querySnapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, tasks };
    } catch (error) {
        console.error("Error al obtener tareas:", error);
        return { success: false, error: "Error al cargar tareas" };
    }
}

async function saveTasks(task) {
    try {
        if (!currentUser) {
            return { success: false, error: "Usuario no autenticado" };
        }
        
        // Añadir el ID del usuario a la tarea
        task.userId = currentUser.uid;
        
        const docRef = await addDoc(collection(db, "tasks"), task);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error al guardar tarea:", error);
        return { success: false, error: "Error al guardar tarea" };
    }
}

async function updateTask(taskId, updates) {
    try {
        if (!currentUser) {
            return { success: false, error: "Usuario no autenticado" };
        }
        
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, updates);
        return { success: true };
    } catch (error) {
        console.error("Error al actualizar tarea:", error);
        return { success: false, error: "Error al actualizar tarea" };
    }
}

async function removeTask(taskId) {
    try {
        if (!currentUser) {
            return { success: false, error: "Usuario no autenticado" };
        }
        
        await deleteDoc(doc(db, "tasks", taskId));
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar tarea:", error);
        return { success: false, error: "Error al eliminar tarea" };
    }
}

// Funciones para materias
async function getSubjects() {
    try {
        if (!currentUser) {
            return { success: false, error: "Usuario no autenticado" };
        }
        
        const subjectsQuery = query(collection(db, "subjects"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(subjectsQuery);
        
        const subjects = [];
        querySnapshot.forEach((doc) => {
            subjects.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, subjects };
    } catch (error) {
        console.error("Error al obtener materias:", error);
        return { success: false, error: "Error al cargar materias" };
    }
}

async function saveSubject(subject) {
    try {
        if (!currentUser) {
            return { success: false, error: "Usuario no autenticado" };
        }
        
        // Añadir el ID del usuario a la materia
        subject.userId = currentUser.uid;
        
        const docRef = await addDoc(collection(db, "subjects"), subject);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error al guardar materia:", error);
        return { success: false, error: "Error al guardar materia" };
    }
}

async function deleteSubject(subjectId) {
    try {
        if (!currentUser) {
            return { success: false, error: "Usuario no autenticado" };
        }
        
        await deleteDoc(doc(db, "subjects", subjectId));
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar materia:", error);
        return { success: false, error: "Error al eliminar materia" };
    }
}

// Funciones para exámenes
async function getExams() {
    try {
        if (!currentUser) {
            return { success: false, error: "Usuario no autenticado" };
        }
        
        const examsQuery = query(collection(db, "exams"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(examsQuery);
        
        const exams = [];
        querySnapshot.forEach((doc) => {
            exams.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, exams };
    } catch (error) {
        console.error("Error al obtener exámenes:", error);
        return { success: false, error: "Error al cargar exámenes" };
    }
}

async function saveExam(exam) {
    try {
        if (!currentUser) {
            return { success: false, error: "Usuario no autenticado" };
        }
        
        // Añadir el ID del usuario al examen
        exam.userId = currentUser.uid;
        
        const docRef = await addDoc(collection(db, "exams"), exam);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error al guardar examen:", error);
        return { success: false, error: "Error al guardar examen" };
    }
}

async function deleteExam(examId) {
    try {
        if (!currentUser) {
            return { success: false, error: "Usuario no autenticado" };
        }
        
        await deleteDoc(doc(db, "exams", examId));
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar examen:", error);
        return { success: false, error: "Error al eliminar examen" };
    }
}

// Exportar todas las funciones necesarias
export {
    getTasks,
    saveTasks,
    updateTask,
    removeTask,
    getSubjects,
    saveSubject,
    deleteSubject,
    getExams,
    saveExam,
    deleteExam
};