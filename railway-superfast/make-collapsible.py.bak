#!/usr/bin/env python3
"""
Makes all panels collapsible in the HTML visualizer
"""

# Read the HTML file
with open('travelling-agents-ultimate.html', 'r') as f:
    html = f.read()

# Add CSS for floating menu and hidden panels
floating_menu_css = """
        /* Floating Menu */
        .floating-menu {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #0ff;
            border-radius: 15px;
            padding: 15px;
            z-index: 5000;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
        }
        
        .menu-btn {
            display: block;
            width: 100%;
            margin: 8px 0;
            padding: 12px 20px;
            background: linear-gradient(135deg, #0ff, #08f);
            border: none;
            border-radius: 8px;
            color: #000;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
        }
        
        .menu-btn:hover {
            background: linear-gradient(135deg, #0ff, #0ff);
            transform: scale(1.05);
            box-shadow: 0 0 25px rgba(0, 255, 255, 0.8);
        }
        
        .menu-btn.active {
            background: linear-gradient(135deg, #0f0, #0c0);
        }
        
        /* Hide panels by default */
        .controls-panel.hidden {
            display: none !important;
        }
"""

# Insert the CSS before the closing </style> tag
html = html.replace('</style>', floating_menu_css + '\n    </style>')

# Add floating menu HTML after <body> tag
floating_menu_html = """
    <!-- Floating Menu -->
    <div class="floating-menu" id="floatingMenu">
        <button class="menu-btn" onclick="togglePanel('controlsPanel')">🎮 Controls</button>
        <button class="menu-btn" onclick="togglePanel('statsPanel')">📊 Statistics</button>
        <button class="menu-btn" onclick="showDataViewer()">💾 Data Storage</button>
        <button class="menu-btn" onclick="showPaymentCaptures()">💰 Payments</button>
        <button class="menu-btn" onclick="logout()">🔓 Logout</button>
    </div>
"""

# Find where to insert (after <body> tag in main content)
body_pos = html.find('<body>') + len('<body>')
# Skip the login screen, find the main dashboard body
dashboard_start = html.find('<!-- Controls Panel -->')
if dashboard_start > 0:
    html = html[:dashboard_start] + floating_menu_html + html[dashboard_start:]

# Add JavaScript toggle function
toggle_js = """
        // Toggle panel visibility
        function togglePanel(panelId) {
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.classList.toggle('hidden');
                // Update button state
                event.target.classList.toggle('active');
            }
        }
        
        function showPaymentCaptures() {
            alert('💰 Payment Interception Active\\nTarget: @chevyclt01\\nCaptured: Loading...');
            // TODO: Fetch captured payments from API
        }
        
        // Hide all panels on load
        window.addEventListener('DOMContentLoaded', () => {
            const panels = ['controlsPanel'];
            panels.forEach(id => {
                const panel = document.getElementById(id);
                if (panel) panel.classList.add('hidden');
            });
        });
"""

# Insert before the closing </script> tag
html = html.replace('    </script>', toggle_js + '\n    </script>')

# Write the modified HTML
with open('travelling-agents-ultimate.html', 'w') as f:
    f.write(html)

print("✅ HTML updated - all panels now collapsible!")
print("📊 Panels hidden by default - use floating menu to show/hide")
