// Patient management application
class PatientManager {
    constructor() {
        this.patients = [];
        this.currentPatientId = 1;
        this.currentPendingRow = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSampleData();
    }

    bindEvents() {
        document.getElementById('addPatient').addEventListener('click', () => this.addPatient());
        document.getElementById('acceptPending').addEventListener('click', () => this.acceptPending());
        document.getElementById('cancelPending').addEventListener('click', () => this.closePendingModal());
        
        // Close modal on outside click
        document.getElementById('pendingModal').addEventListener('click', (e) => {
            if (e.target.id === 'pendingModal') {
                this.closePendingModal();
            }
        });
    }

    loadSampleData() {
        // Add sample patients for demonstration
        const samplePatients = [
            {
                id: this.currentPatientId++,
                iea: '2024-01-15',
                names: 'Juan Carlos Pérez Rodríguez',
                age: 45,
                ci: '12345678',
                nh: 'NH-2024-001',
                phone: '0412-1234567',
                diagnosis: 'Apendicitis aguda',
                plan: 'Apendicectomía laparoscópica',
                pendientes: [
                    { text: 'Realizar exámenes de laboratorio', completed: true },
                    { text: 'Valoración preanestésica', completed: false }
                ],
                specialist: 'Dr. López',
                comment: 'Paciente alérgico a penicilina',
                completed: false
            }
        ];

        samplePatients.forEach(patient => this.patients.push(patient));
        this.renderTable();
    }

    addPatient() {
        const newPatient = {
            id: this.currentPatientId++,
            iea: new Date().toISOString().split('T')[0],
            names: '',
            age: '',
            ci: '',
            nh: '',
            phone: '',
            diagnosis: '',
            plan: '',
            pendientes: [],
            specialist: '',
            comment: '',
            completed: false
        };

        this.patients.push(newPatient);
        this.renderTable();
        
        // Focus on the first editable field of the new patient
        setTimeout(() => {
            const lastRow = document.querySelector(`tr[data-id="${newPatient.id}"]`);
            const firstInput = lastRow.querySelector('.editable-cell');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    deletePatient(id) {
        if (confirm('¿Está seguro de que desea eliminar este paciente?')) {
            this.patients = this.patients.filter(patient => patient.id !== id);
            this.renderTable();
        }
    }

    updatePatient(id, field, value) {
        const patient = this.patients.find(p => p.id === id);
        if (patient) {
            patient[field] = value;
            
            // Toggle completed status
            if (field === 'completed') {
                const row = document.querySelector(`tr[data-id="${id}"]`);
                if (value) {
                    row.classList.add('completed');
                } else {
                    row.classList.remove('completed');
                }
            }
        }
    }

    openPendingModal(rowId) {
        this.currentPendingRow = rowId;
        document.getElementById('pendingInput').value = '';
        document.getElementById('pendingModal').classList.remove('hidden');
        document.getElementById('pendingModal').classList.add('flex');
        document.getElementById('pendingInput').focus();
    }

    closePendingModal() {
        document.getElementById('pendingModal').classList.add('hidden');
        document.getElementById('pendingModal').classList.remove('flex');
        this.currentPendingRow = null;
    }

    acceptPending() {
        const input = document.getElementById('pendingInput');
        const text = input.value.trim();
        
        if (text && this.currentPendingRow) {
            const patient = this.patients.find(p => p.id === this.currentPendingRow);
            if (patient) {
                patient.pendientes.push({
                    text: text,
                    completed: false
                });
                this.renderTable();
            }
        }
        
        this.closePendingModal();
    }

    togglePendiente(patientId, pendienteIndex) {
        const patient = this.patients.find(p => p.id === patientId);
        if (patient && patient.pendientes[pendienteIndex]) {
            patient.pendientes[pendienteIndex].completed = !patient.pendientes[pendienteIndex].completed;
            this.renderTable();
        }
    }

    handleInput(el) {
        const isTextarea = el.tagName.toLowerCase() === 'textarea';
        // Capitalize first letter and after periods
        const v = el.value;
        el.value = this.toSentenceCase(v);
        // Auto-resize
        if (isTextarea) {
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 400) + 'px';
        } else {
            const min = 60, max = 300;
            const approx = Math.ceil((el.value.length + 1) * 8);
            el.style.width = Math.max(min, Math.min(max, approx)) + 'px';
        }
    }

    toSentenceCase(str) {
        if (!str) return '';
        return str.replace(/(^\s*\p{L})|([.]\s*\p{L})/gu, (m) => m.toUpperCase());
    }

    renderTable() {
        const tbody = document.getElementById('patientTableBody');
        tbody.innerHTML = '';

        this.patients.forEach(patient => {
            const row = document.createElement('tr');
            row.className = `patient-row ${patient.completed ? 'completed' : ''}`;
            row.setAttribute('data-id', patient.id);

            row.innerHTML = `
                <td class="px-4 py-3 border-b font-medium">${patient.id}</td>
                
                <td class="px-4 py-3 border-b">
                    <input type="date" class="editable-cell date-input" value="${patient.iea}" 
                           onchange="patientManager.updatePatient(${patient.id}, 'iea', this.value)">
                </td>
                
                <td class="px-4 py-3 border-b">
                    <input type="text" class="editable-cell" value="${patient.names}" 
                           onblur="patientManager.updatePatient(${patient.id}, 'names', this.value)"
                           placeholder="Nombres y apellidos">
                </td>
                
                <td class="px-4 py-3 border-b">
                    <input type="number" class="editable-cell age-input" value="${patient.age}" 
                           onblur="patientManager.updatePatient(${patient.id}, 'age', this.value)"
                           placeholder="Edad">
                </td>
                
                <td class="px-4 py-3 border-b">
                    <div class="flex gap-2 items-center">
                        <label class="text-xs text-gray-600">CI:</label>
                        <input type="text" class="editable-cell" value="${patient.ci}" 
                               onblur="patientManager.updatePatient(${patient.id}, 'ci', this.value)"
                               placeholder="CI">
                        <label class="text-xs text-gray-600">NH:</label>
                        <input type="text" class="editable-cell" value="${patient.nh}" 
                               onblur="patientManager.updatePatient(${patient.id}, 'nh', this.value)"
                               placeholder="NH">
                    </div>
                </td>
                
                <td class="px-4 py-3 border-b">
                    <input type="tel" class="editable-cell phone-input" value="${patient.phone}" 
                           onblur="patientManager.updatePatient(${patient.id}, 'phone', this.value)"
                           placeholder="Teléfono">
                </td>
                
                <td class="px-4 py-3 border-b">
                    <textarea class="editable-cell diagnosis-input" rows="2"
                              onblur="patientManager.updatePatient(${patient.id}, 'diagnosis', this.value)"
                              placeholder="Diagnóstico">${patient.diagnosis}</textarea>
                </td>
                
                <td class="px-4 py-3 border-b">
                    <textarea class="editable-cell plan-input" rows="2"
                              onblur="patientManager.updatePatient(${patient.id}, 'plan', this.value)"
                              placeholder="Plan">${patient.plan}</textarea>
                </td>
                
                <td class="px-4 py-3 border-b">
                    <div class="space-y-1">
                        ${patient.pendientes.map((pendiente, index) => `
                            <div class="pendiente-item">
                                <input type="checkbox" class="pendiente-checkbox" 
                                       ${pendiente.completed ? 'checked' : ''}
                                       onchange="patientManager.togglePendiente(${patient.id}, ${index})">
                                <span class="pendiente-text ${pendiente.completed ? 'completed' : ''}">${pendiente.text}</span>
                            </div>
                        `).join('')}
                        <button class="add-pendiente-btn" onclick="patientManager.openPendingModal(${patient.id})">+</button>
                    </div>
                </td>
                
                <td class="px-4 py-3 border-b">
                    <button class="attachment-indicator ${patient.attachment ? 'has-attachment' : ''}" 
                            onclick="patientManager.handleAttachment(${patient.id})">
                        📎 ${patient.attachment ? 'Adjunto' : 'Adjuntar'}
                    </button>
                </td>
                
                <td class="px-4 py-3 border-b">
                    <textarea class="editable-cell comment-input" rows="2"
                              onblur="patientManager.updatePatient(${patient.id}, 'comment', this.value)"
                              placeholder="Comentario">${patient.comment}</textarea>
                </td>
                
                <td class="px-4 py-3 border-b">
                    <input type="checkbox" class="pendiente-checkbox" 
                           ${patient.completed ? 'checked' : ''}
                           onchange="patientManager.updatePatient(${patient.id}, 'completed', this.checked)">
                </td>
                
                <td class="px-4 py-3 border-b">
                    <button class="delete-btn" onclick="patientManager.deletePatient(${patient.id})">🗑️</button>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Apply initial auto-resize to all editable cells
        document.querySelectorAll('.editable-cell').forEach((el) => this.handleInput(el));
    }
}

// Initialize the application
const patientManager = new PatientManager();

// Handle Enter key in pending modal
document.getElementById('pendingInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        patientManager.acceptPending();
    }
});