import re

with open('travelling-agents-ultimate.html', 'r') as f:
    html = f.read()

# Find controls-panel CSS and add display: none
html = re.sub(
    r'(\.controls-panel \{[^}]+)',
    r'\1\n            display: none;',
    html
)

# Find floating-menu CSS and add display: none initially
html = re.sub(
    r'(\.floating-menu \{[^}]+)',
    r'\1\n            display: none;',
    html
)

# Add a small toggle button that's always visible
toggle_button_css = """
        /* Always-visible toggle button */
        .show-menu-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #0ff, #08f);
            border: 2px solid #0ff;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: all 0.3s ease;
        }
        
        .show-menu-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 0 40px rgba(0, 255, 255, 1);
        }
"""

html = html.replace('</style>', toggle_button_css + '\n    </style>')

# Add toggle button HTML right after body in main content
toggle_button_html = """
    <!-- Always-visible menu toggle button -->
    <button class="show-menu-btn" onclick="toggleMainMenu()" title="Show Menu">☰</button>
"""

# Find where to insert (after the main dashboard starts)
html = html.replace('<!-- Floating Menu -->', toggle_button_html + '\n    <!-- Floating Menu -->')

# Add JavaScript to toggle menu visibility
toggle_js = """
        function toggleMainMenu() {
            const menu = document.getElementById('floatingMenu');
            const controls = document.getElementById('controlsPanel');
            
            if (menu.style.display === 'none' || !menu.style.display) {
                menu.style.display = 'block';
            } else {
                menu.style.display = 'none';
                if (controls) controls.style.display = 'none';
            }
        }
"""

html = html.replace('    </script>', toggle_js + '\n    </script>')

with open('travelling-agents-ultimate.html', 'w') as f:
    f.write(html)

print("✅ Updated: All controls hidden, only visualizer visible")
print("📍 Added: Small menu button in top-right corner")
