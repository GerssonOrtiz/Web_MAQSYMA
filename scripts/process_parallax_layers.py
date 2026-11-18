import os
import cv2
import numpy as np
from PIL import Image, ImageFilter

BASE_DIR = r"public/assets/hero/frames"

def process_scene_1(scene_dir):
    base_path = os.path.join(scene_dir, "base.png")
    img = Image.open(base_path).convert("RGBA")
    w, h = img.size

    # 1. Background: Cielo y estructura superior con blur atmosférico
    bg = img.copy()
    bg_blurred = bg.filter(ImageFilter.GaussianBlur(radius=6))
    # Para el fondo oscurecemos sutilmente la base para dar contraste a los elementos frontales
    bg_blurred.save(os.path.join(scene_dir, "bg", "bg_desktop.webp"), "WEBP", quality=82)

    # 2. Midground: La estructura completa de la fachada nítida
    img.save(os.path.join(scene_dir, "mid", "mid_desktop.webp"), "WEBP", quality=85)

    # 3. Foreground: Vegetación y marco frontal inferior/izquierdo con canal alpha
    # Creamos una máscara para el primer plano (arbustos y esquinas inferiores)
    img_np = np.array(img)
    fg_np = np.zeros_like(img_np)
    
    # Máscara de profundidad basada en posición y sombras/arbustos (inferior y laterales)
    # Arbustos están en el tercio inferior izquierdo y derecho
    y_indices, x_indices = np.indices((h, w))
    # Máscara gradiente y elementos bajos
    left_bush = (x_indices < w * 0.35) & (y_indices > h * 0.65)
    right_bush = (x_indices > w * 0.85) & (y_indices > h * 0.65)
    ground_reflection = (y_indices > h * 0.85)
    fg_mask = left_bush | right_bush | ground_reflection

    # Suavizar bordes de la máscara
    mask_float = fg_mask.astype(np.float32)
    mask_blurred = cv2.GaussianBlur(mask_float, (45, 45), 0)
    
    fg_np[:, :, :3] = img_np[:, :, :3]
    fg_np[:, :, 3] = (mask_blurred * 255).astype(np.uint8)
    
    fg_img = Image.fromarray(fg_np)
    fg_img.save(os.path.join(scene_dir, "fg", "fg_desktop.webp"), "WEBP", quality=85)
    fg_img.save(os.path.join(scene_dir, "fg", "fg_desktop.png"), "PNG")

    # Mobile vertical crop
    target_w = int(h * (9 / 16))
    crop_x1 = (w - target_w) // 2
    mobile_crop = img.crop((crop_x1, 0, crop_x1 + target_w, h)).resize((828, 1472), Image.LANCZOS)
    mobile_crop.save(os.path.join(scene_dir, "mid", "mid_mobile.webp"), "WEBP", quality=80)
    
    mobile_bg = bg_blurred.crop((crop_x1, 0, crop_x1 + target_w, h)).resize((828, 1472), Image.LANCZOS)
    mobile_bg.save(os.path.join(scene_dir, "bg", "bg_mobile.webp"), "WEBP", quality=75)

    print("Scene 1 processed.")

def process_scene_2(scene_dir):
    base_path = os.path.join(scene_dir, "base.png")
    img = Image.open(base_path).convert("RGBA")
    w, h = img.size

    # 1. Background: Techo industrial, vigas, luces lineales lejanas
    bg = img.copy()
    bg_blurred = bg.filter(ImageFilter.GaussianBlur(radius=5))
    bg_blurred.save(os.path.join(scene_dir, "bg", "bg_desktop.webp"), "WEBP", quality=82)

    # 2. Midground: Mesón de recepción y logo MAQSYMA/ESAB
    img.save(os.path.join(scene_dir, "mid", "mid_desktop.webp"), "WEBP", quality=85)

    # 3. Foreground: Podio iluminado inferior derecho y plantas laterales
    img_np = np.array(img)
    fg_np = np.zeros_like(img_np)
    y_indices, x_indices = np.indices((h, w))
    
    # Podio destacado en primer plano (inferior derecho e inferior medio)
    podium_zone = (x_indices > w * 0.45) & (y_indices > h * 0.60)
    left_plant = (x_indices < w * 0.20) & (y_indices > h * 0.40)
    fg_mask = podium_zone | left_plant

    mask_float = fg_mask.astype(np.float32)
    mask_blurred = cv2.GaussianBlur(mask_float, (55, 55), 0)

    fg_np[:, :, :3] = img_np[:, :, :3]
    fg_np[:, :, 3] = (mask_blurred * 255).astype(np.uint8)
    
    fg_img = Image.fromarray(fg_np)
    fg_img.save(os.path.join(scene_dir, "fg", "fg_desktop.webp"), "WEBP", quality=85)
    fg_img.save(os.path.join(scene_dir, "fg", "fg_desktop.png"), "PNG")

    # Mobile vertical crop
    target_w = int(h * (9 / 16))
    crop_x1 = int(w * 0.15) # centrado un poco en recepción
    mobile_crop = img.crop((crop_x1, 0, crop_x1 + target_w, h)).resize((828, 1472), Image.LANCZOS)
    mobile_crop.save(os.path.join(scene_dir, "mid", "mid_mobile.webp"), "WEBP", quality=80)
    
    mobile_bg = bg_blurred.crop((crop_x1, 0, crop_x1 + target_w, h)).resize((828, 1472), Image.LANCZOS)
    mobile_bg.save(os.path.join(scene_dir, "bg", "bg_mobile.webp"), "WEBP", quality=75)

    print("Scene 2 processed.")

def process_scene_3(scene_dir):
    base_path = os.path.join(scene_dir, "base.png")
    img = Image.open(base_path).convert("RGBA")
    w, h = img.size

    # 1. Background: Pared MAQSYMA negra acanalada y techo
    bg = img.copy()
    bg_blurred = bg.filter(ImageFilter.GaussianBlur(radius=6))
    bg_blurred.save(os.path.join(scene_dir, "bg", "bg_desktop.webp"), "WEBP", quality=82)

    # 2. Midground: Escenario central con pedestales y máquinas
    img.save(os.path.join(scene_dir, "mid", "mid_desktop.webp"), "WEBP", quality=85)

    # 3. Foreground: Máquinas de soldar ESAB en pedestales frontales (izquierda y derecha en primerísimo plano)
    img_np = np.array(img)
    fg_np = np.zeros_like(img_np)
    y_indices, x_indices = np.indices((h, w))
    
    # Máquinas ESAB en primer plano
    left_machine = (x_indices < w * 0.38) & (y_indices > h * 0.45)
    right_machine = (x_indices > w * 0.70) & (y_indices > h * 0.50)
    fg_mask = left_machine | right_machine

    mask_float = fg_mask.astype(np.float32)
    mask_blurred = cv2.GaussianBlur(mask_float, (41, 41), 0)

    fg_np[:, :, :3] = img_np[:, :, :3]
    fg_np[:, :, 3] = (mask_blurred * 255).astype(np.uint8)
    
    fg_img = Image.fromarray(fg_np)
    fg_img.save(os.path.join(scene_dir, "fg", "fg_desktop.webp"), "WEBP", quality=85)
    fg_img.save(os.path.join(scene_dir, "fg", "fg_desktop.png"), "PNG")

    # Mobile vertical crop (centrado en máquina protagonista + pared)
    target_w = int(h * (9 / 16))
    crop_x1 = int(w * 0.20)
    mobile_crop = img.crop((crop_x1, 0, crop_x1 + target_w, h)).resize((828, 1472), Image.LANCZOS)
    mobile_crop.save(os.path.join(scene_dir, "mid", "mid_mobile.webp"), "WEBP", quality=80)
    
    mobile_bg = bg_blurred.crop((crop_x1, 0, crop_x1 + target_w, h)).resize((828, 1472), Image.LANCZOS)
    mobile_bg.save(os.path.join(scene_dir, "bg", "bg_mobile.webp"), "WEBP", quality=75)

    print("Scene 3 processed.")

def process_scene_4(scene_dir):
    base_path = os.path.join(scene_dir, "base.png")
    img = Image.open(base_path).convert("RGBA")
    w, h = img.size

    # 1. Background: Estantería de guantes/accesorios y pared
    bg = img.copy()
    bg_blurred = bg.filter(ImageFilter.GaussianBlur(radius=5))
    bg_blurred.save(os.path.join(scene_dir, "bg", "bg_desktop.webp"), "WEBP", quality=82)

    # 2. Midground: Vitrina completa de EPP y logo MAQSYMA
    img.save(os.path.join(scene_dir, "mid", "mid_desktop.webp"), "WEBP", quality=85)

    # 3. Foreground: Mostrador con cascos de soldar en primer plano y máquina izquierda
    img_np = np.array(img)
    fg_np = np.zeros_like(img_np)
    y_indices, x_indices = np.indices((h, w))
    
    # Mostrador central con cascos y mesa ESAB frontal
    helmets_counter = (x_indices > w * 0.30) & (x_indices < w * 0.60) & (y_indices > h * 0.50)
    esab_desk = (x_indices > w * 0.65) & (y_indices > h * 0.58)
    left_welder = (x_indices < w * 0.25) & (y_indices > h * 0.50)
    fg_mask = helmets_counter | esab_desk | left_welder

    mask_float = fg_mask.astype(np.float32)
    mask_blurred = cv2.GaussianBlur(mask_float, (45, 45), 0)

    fg_np[:, :, :3] = img_np[:, :, :3]
    fg_np[:, :, 3] = (mask_blurred * 255).astype(np.uint8)
    
    fg_img = Image.fromarray(fg_np)
    fg_img.save(os.path.join(scene_dir, "fg", "fg_desktop.webp"), "WEBP", quality=85)
    fg_img.save(os.path.join(scene_dir, "fg", "fg_desktop.png"), "PNG")

    # Mobile vertical crop
    target_w = int(h * (9 / 16))
    crop_x1 = int(w * 0.30) # enfocado en cascos y logo
    mobile_crop = img.crop((crop_x1, 0, crop_x1 + target_w, h)).resize((828, 1472), Image.LANCZOS)
    mobile_crop.save(os.path.join(scene_dir, "mid", "mid_mobile.webp"), "WEBP", quality=80)
    
    mobile_bg = bg_blurred.crop((crop_x1, 0, crop_x1 + target_w, h)).resize((828, 1472), Image.LANCZOS)
    mobile_bg.save(os.path.join(scene_dir, "bg", "bg_mobile.webp"), "WEBP", quality=75)

    print("Scene 4 processed.")

if __name__ == "__main__":
    process_scene_1(os.path.join(BASE_DIR, "scene-1"))
    process_scene_2(os.path.join(BASE_DIR, "scene-2"))
    process_scene_3(os.path.join(BASE_DIR, "scene-3"))
    process_scene_4(os.path.join(BASE_DIR, "scene-4"))
    print("All layers processed successfully.")
