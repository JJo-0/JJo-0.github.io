document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            const target = (this.getAttribute('href') || '').replace('#', '');
            if (!target) return;
            
            // Remove active class from all nav items and content sections
            navItems.forEach(nav => nav.classList.remove('bg-emerald-100', 'border-emerald-400', 'text-emerald-800'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked nav item
            this.classList.add('bg-emerald-100', 'border-emerald-400', 'text-emerald-800');
            
            // Show target content section
            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Set initial active state
    if (navItems.length > 0) {
        navItems[0].classList.add('bg-emerald-100', 'border-emerald-400', 'text-emerald-800');
    }
    const firstSection = document.getElementById('dashboard');
    if (firstSection) {
        firstSection.classList.add('active');
    }
});
