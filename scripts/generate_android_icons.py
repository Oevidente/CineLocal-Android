#!/usr/bin/env python3
"""
Script to generate all Android app launcher icons, adaptive icons, splash screens,
and PWA/web assets from the root favicon.png (1254x1254) brand asset.
"""

import os
import subprocess
import shutil

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAVICON_SRC = os.path.join(ROOT_DIR, 'favicon.png')
RES_DIR = os.path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'res')
PUBLIC_DIR = os.path.join(ROOT_DIR, 'public')
TMP_DIR = '/tmp/cinelocal_assets'

def run_cmd(cmd):
    subprocess.check_call(cmd, shell=False)

def main():
    if not os.path.exists(FAVICON_SRC):
        print(f"Error: Source image {FAVICON_SRC} not found!")
        return

    os.makedirs(TMP_DIR, exist_ok=True)
    os.makedirs(PUBLIC_DIR, exist_ok=True)

    print("1. Creating base master assets from favicon.png...")

    # 1A. Transparent foreground (Extract white 'C' on transparent background)
    c_transparent = os.path.join(TMP_DIR, 'c_transparent.png')
    run_cmd([
        'convert', FAVICON_SRC,
        '-fuzz', '25%',
        '-transparent', '#E50914',
        c_transparent
    ])

    # 1B. Squircle Icon (Subtly rounded corners for standard launcher icon)
    squircle_mask = os.path.join(TMP_DIR, 'squircle_mask.png')
    squircle_base = os.path.join(TMP_DIR, 'squircle_base.png')
    run_cmd([
        'convert', '-size', '1254x1254', 'xc:none',
        '-fill', 'white', '-draw', 'roundrectangle 0,0 1253,1253 180,180',
        squircle_mask
    ])
    run_cmd([
        'convert', FAVICON_SRC, squircle_mask,
        '-alpha', 'off', '-compose', 'CopyOpacity', '-composite',
        squircle_base
    ])

    # 1C. Circular Icon (For round icon launchers)
    circle_mask = os.path.join(TMP_DIR, 'circle_mask.png')
    circle_base = os.path.join(TMP_DIR, 'circle_base.png')
    run_cmd([
        'convert', '-size', '1254x1254', 'xc:none',
        '-fill', 'white', '-draw', 'circle 627,627 627,2',
        circle_mask
    ])
    run_cmd([
        'convert', FAVICON_SRC, circle_mask,
        '-alpha', 'off', '-compose', 'CopyOpacity', '-composite',
        circle_base
    ])

    # 1D. Full-bleed Maskable PWA Base
    # Safe zone for maskable PWA is inner 80% (scale 0.8) on #E50914 background
    maskable_base = os.path.join(TMP_DIR, 'maskable_512.png')
    run_cmd([
        'convert', '-size', '512x512', 'xc:#E50914',
        '(', FAVICON_SRC, '-resize', '410x410', ')',
        '-gravity', 'center', '-composite',
        maskable_base
    ])

    print("2. Generating Android Mipmap Icons (Adaptive foreground, standard, round)...")
    densities = {
        'mipmap-mdpi': {'icon': 48, 'fg': 108},
        'mipmap-hdpi': {'icon': 72, 'fg': 162},
        'mipmap-xhdpi': {'icon': 96, 'fg': 216},
        'mipmap-xxhdpi': {'icon': 144, 'fg': 324},
        'mipmap-xxxhdpi': {'icon': 192, 'fg': 432},
    }

    for folder, sizes in densities.items():
        target_dir = os.path.join(RES_DIR, folder)
        os.makedirs(target_dir, exist_ok=True)

        icon_sz = sizes['icon']
        fg_sz = sizes['fg']

        # ic_launcher.png
        run_cmd([
            'convert', squircle_base,
            '-resize', f'{icon_sz}x{icon_sz}',
            os.path.join(target_dir, 'ic_launcher.png')
        ])

        # ic_launcher_round.png
        run_cmd([
            'convert', circle_base,
            '-resize', f'{icon_sz}x{icon_sz}',
            os.path.join(target_dir, 'ic_launcher_round.png')
        ])

        # ic_launcher_foreground.png (White 'C' on transparent canvas)
        run_cmd([
            'convert', c_transparent,
            '-resize', f'{fg_sz}x{fg_sz}',
            os.path.join(target_dir, 'ic_launcher_foreground.png')
        ])
        print(f"  ✓ Generated {folder} (icon: {icon_sz}x{icon_sz}, fg: {fg_sz}x{fg_sz})")

    print("3. Generating Android Splash Screens...")
    splash_targets = {
        'drawable': (480, 320),
        'drawable-port-mdpi': (320, 480),
        'drawable-port-hdpi': (480, 800),
        'drawable-port-xhdpi': (720, 1280),
        'drawable-port-xxhdpi': (960, 1600),
        'drawable-port-xxxhdpi': (1280, 1920),
        'drawable-land-mdpi': (480, 320),
        'drawable-land-hdpi': (800, 480),
        'drawable-land-xhdpi': (1280, 720),
        'drawable-land-xxhdpi': (1600, 960),
        'drawable-land-xxxhdpi': (1920, 1280),
    }

    for folder, (w, h) in splash_targets.items():
        target_dir = os.path.join(RES_DIR, folder)
        os.makedirs(target_dir, exist_ok=True)

        # Badge size scaled proportionally
        badge_sz = max(96, min(int(min(w, h) * 0.35), 320))
        temp_badge = os.path.join(TMP_DIR, f'badge_{badge_sz}.png')
        run_cmd([
            'convert', squircle_base,
            '-resize', f'{badge_sz}x{badge_sz}',
            temp_badge
        ])

        target_file = os.path.join(target_dir, 'splash.png')
        run_cmd([
            'convert', '-size', f'{w}x{h}', 'xc:#141414',
            temp_badge,
            '-gravity', 'center',
            '-composite',
            target_file
        ])
        print(f"  ✓ Generated splash for {folder} ({w}x{h}, badge: {badge_sz}px)")

    print("4. Updating Web and PWA icons in /public...")
    # public/favicon.png (192x192)
    run_cmd(['convert', FAVICON_SRC, '-resize', '192x192', os.path.join(PUBLIC_DIR, 'favicon.png')])
    # public/apple-touch-icon.png (180x180)
    run_cmd(['convert', FAVICON_SRC, '-resize', '180x180', os.path.join(PUBLIC_DIR, 'apple-touch-icon.png')])
    # public/pwa-192x192.png (192x192)
    run_cmd(['convert', FAVICON_SRC, '-resize', '192x192', os.path.join(PUBLIC_DIR, 'pwa-192x192.png')])
    # public/pwa-512x512.png (512x512)
    run_cmd(['convert', FAVICON_SRC, '-resize', '512x512', os.path.join(PUBLIC_DIR, 'pwa-512x512.png')])
    # public/pwa-maskable-512x512.png (512x512)
    shutil.copyfile(maskable_base, os.path.join(PUBLIC_DIR, 'pwa-maskable-512x512.png'))
    print("  ✓ Public web & PWA assets updated")

    print("5. Updating XML background & removing old robot vector...")
    # Update values/ic_launcher_background.xml
    val_bg_path = os.path.join(RES_DIR, 'values', 'ic_launcher_background.xml')
    os.makedirs(os.path.dirname(val_bg_path), exist_ok=True)
    with open(val_bg_path, 'w') as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#E50914</color>
</resources>
''')

    # Update drawable/ic_launcher_background.xml
    draw_bg_path = os.path.join(RES_DIR, 'drawable', 'ic_launcher_background.xml')
    os.makedirs(os.path.dirname(draw_bg_path), exist_ok=True)
    with open(draw_bg_path, 'w') as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportHeight="108"
    android:viewportWidth="108">
    <path
        android:fillColor="#E50914"
        android:pathData="M0,0h108v108h-108z" />
</vector>
''')

    # Remove old drawable-v24/ic_launcher_foreground.xml if present
    robot_vector = os.path.join(RES_DIR, 'drawable-v24', 'ic_launcher_foreground.xml')
    if os.path.exists(robot_vector):
        os.remove(robot_vector)
        print("  ✓ Removed outdated drawable-v24/ic_launcher_foreground.xml")

    # Clean up temp
    shutil.rmtree(TMP_DIR, ignore_errors=True)
    print("\nAll Android icons, splash screens, and PWA assets generated successfully!")

if __name__ == '__main__':
    main()
