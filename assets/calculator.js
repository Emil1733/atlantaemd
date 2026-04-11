/**
 * Atlanta Pool Removal Pros - Modal Calculator Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('calc-modal-wrapper');
    const openBtns = document.querySelectorAll('.open-calc');
    const closeBtn = document.querySelector('.calc-close');
    const steps = document.querySelectorAll('.calc-step');
    const progressBar = document.querySelector('.progress-bar');
    
    if (!modal) return;

    let currentStep = 1;
    let formData = {
        poolType: 'concrete',
        poolSize: 'medium',
        zip: '',
        name: '',
        phone: ''
    };

    // Open Modal
    openBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
            goToStep(1);
        };
    });

    // Close Modal
    if (closeBtn) closeBtn.onclick = closeModal;

    function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    window.onclick = (event) => {
        if (event.target == modal) closeModal();
    };

    // Navigation Function
    function goToStep(step) {
        console.log("Moving to step:", step);
        currentStep = step;
        steps.forEach(s => s.classList.remove('active'));
        const targetStep = document.querySelector(`.calc-step[data-step="${step}"]`);
        if (targetStep) targetStep.classList.add('active');
        
        // Update Progress Bar
        if (progressBar) {
            const progress = (step / steps.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    // Handle Option Selections (Steps 1 & 2)
    document.querySelectorAll('.calc-option').forEach(option => {
        option.onclick = function() {
            const step = this.closest('.calc-step').dataset.step;
            const value = this.dataset.value;

            // Highlight selected
            this.closest('.calc-btn-grid').querySelectorAll('.calc-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');

            if (step == 1) {
                formData.poolType = value;
                setTimeout(() => goToStep(2), 300);
            } else if (step == 2) {
                formData.poolSize = value;
                setTimeout(() => goToStep(3), 300);
            }
        };
    });

    // Handle Form Submission (Step 3)
    const leadForm = document.getElementById('calc-lead-gate');
    if (leadForm) {
        leadForm.onsubmit = function(e) {
            e.preventDefault();
            console.log("Form submitted, capturing data...");
            
            formData.zip = document.getElementById('calc-zip')?.value || '';
            formData.name = document.getElementById('calc-name')?.value || '';
            formData.phone = document.getElementById('calc-phone')?.value || '';

            // Validation
            if (!formData.phone || !formData.zip) {
                alert('Please provide your zip and phone to see the estimate.');
                return false;
            }

            // Calculate Result
            const basePrice = formData.poolType === 'concrete' ? 12000 : 8000;
            const sizeMult = formData.poolSize === 'large' ? 1.4 : formData.poolSize === 'small' ? 0.8 : 1.0;
            
            const total = basePrice * sizeMult;
            const low = Math.round((total * 0.9) / 100) * 100;
            const high = Math.round((total * 1.1) / 100) * 100;

            document.getElementById('res-low').innerText = low.toLocaleString();
            document.getElementById('res-high').innerText = high.toLocaleString();
            document.getElementById('res-type').innerText = formData.poolType + ' removal';

            // Record Lead (Supabase Production Integration)
            const leadData = {
                full_name: formData.name,
                phone: formData.phone,
                pool_type: formData.poolType,
                pool_size: formData.poolSize,
                estimated_price_range: `$${low.toLocaleString()} - $${high.toLocaleString()}`,
                source_page: window.location.pathname + " (Zip: " + formData.zip + ")"
            };

            console.log("Syncing to Supabase:", leadData);

            fetch('https://nbeqlzzpxxydgmfactzm.supabase.co/rest/v1/emd_leads_atlanta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iZXFsenpweHh5ZGdtZmFjdHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NzMyMjEsImV4cCI6MjA3MTM0OTIyMX0.x_oBYIkqkgtZCqcjVJb7mipojIAM4sHwsDJsDVutnhs',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iZXFsenpweHh5ZGdtZmFjdHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NzMyMjEsImV4cCI6MjA3MTM0OTIyMX0.x_oBYIkqkgtZCqcjVJb7mipojIAM4sHwsDJsDVutnhs'
                },
                body: JSON.stringify(leadData)
            })
            .then(res => {
                if (res.ok) {
                    console.log("LEAD SYNCED TO SUPABASE");
                } else {
                    console.error("Supabase error status:", res.status);
                }
            })
            .catch(err => console.error("SUPABASE FETCH ERROR:", err));
            
            // Show Results
            goToStep(4);
            return false;
        };
    }

    // Re-calculating
    window.restartCalc = () => goToStep(1);
    
    // Mobile Menu Toggle (Shared logic)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');
    if(mobileMenuBtn) mobileMenuBtn.onclick = () => navLinksContainer.classList.toggle('mobile-active');
    // --- Scroll-Based Visibility for Sticky CTA ---
    const stickyCta = document.querySelector('.sticky-mobile-cta');
    if (stickyCta) {
        // Initial state: Hidden if scrolled to top
        if (window.scrollY < 300) {
            stickyCta.style.display = 'none';
        }

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                stickyCta.style.display = 'flex';
                // Add a small fade-in feel if possible via class
                stickyCta.style.opacity = '1';
            } else {
                stickyCta.style.display = 'none';
            }
        });
    }
});
