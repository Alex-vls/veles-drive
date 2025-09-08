#!/usr/bin/env python3
"""
Design Analysis Script
Анализ PNG скриншотов дизайна и создание структуры проекта
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Any
import shutil

class DesignAnalyzer:
    def __init__(self, screenshots_dir: str = "screen"):
        self.screenshots_dir = Path(screenshots_dir)
        self.output_dir = Path("design-analysis")
        
    def analyze_screenshots(self) -> Dict[str, Any]:
        """Анализировать скриншоты и создать структуру"""
        if not self.screenshots_dir.exists():
            print(f"❌ Папка {self.screenshots_dir} не найдена")
            return {}
        
        # Получить все PNG файлы
        png_files = list(self.screenshots_dir.glob("*.png"))
        print(f"📁 Найдено {len(png_files)} PNG файлов")
        
        # Создать структуру анализа
        analysis = {
            "total_files": len(png_files),
            "categories": {
                "pages": [],
                "components": [],
                "cards": [],
                "images": [],
                "frames": []
            },
            "file_sizes": {},
            "recommendations": []
        }
        
        # Анализировать каждый файл
        for file_path in png_files:
            file_name = file_path.name
            file_size = file_path.stat().st_size
            
            analysis["file_sizes"][file_name] = file_size
            
            # Категоризировать файлы
            if file_name.startswith("frame"):
                analysis["categories"]["frames"].append({
                    "name": file_name,
                    "size": file_size,
                    "type": "frame"
                })
            elif file_name.startswith("cards"):
                analysis["categories"]["cards"].append({
                    "name": file_name,
                    "size": file_size,
                    "type": "component"
                })
            elif file_name.startswith("image"):
                analysis["categories"]["images"].append({
                    "name": file_name,
                    "size": file_size,
                    "type": "image"
                })
            else:
                analysis["categories"]["pages"].append({
                    "name": file_name,
                    "size": file_size,
                    "type": "page"
                })
        
        return analysis
    
    def create_project_structure(self, analysis: Dict[str, Any]) -> None:
        """Создать структуру проекта на основе анализа"""
        # Создать папки
        project_dirs = [
            "frontend/src/components/design",
            "frontend/src/pages/design",
            "frontend/src/assets/design",
            "frontend/src/styles/design-tokens"
        ]
        
        for dir_path in project_dirs:
            Path(dir_path).mkdir(parents=True, exist_ok=True)
        
        # Копировать файлы в соответствующие папки
        self.copy_files_to_structure(analysis)
        
        # Создать файлы конфигурации
        self.create_config_files(analysis)
        
        print("✅ Структура проекта создана!")
    
    def copy_files_to_structure(self, analysis: Dict[str, Any]) -> None:
        """Копировать файлы в структуру проекта"""
        # Копировать фреймы (страницы)
        for frame in analysis["categories"]["frames"]:
            src = self.screenshots_dir / frame["name"]
            dst = Path("frontend/src/pages/design") / frame["name"]
            shutil.copy2(src, dst)
            print(f"📄 Скопирован фрейм: {frame['name']}")
        
        # Копировать карточки (компоненты)
        for card in analysis["categories"]["cards"]:
            src = self.screenshots_dir / card["name"]
            dst = Path("frontend/src/components/design") / card["name"]
            shutil.copy2(src, dst)
            print(f"🎴 Скопирована карточка: {card['name']}")
        
        # Копировать изображения
        for image in analysis["categories"]["images"]:
            src = self.screenshots_dir / image["name"]
            dst = Path("frontend/src/assets/design") / image["name"]
            shutil.copy2(src, dst)
            print(f"🖼️ Скопировано изображение: {image['name']}")
    
    def create_config_files(self, analysis: Dict[str, Any]) -> None:
        """Создать файлы конфигурации"""
        
        # Создать папку design-analysis
        Path("design-analysis").mkdir(exist_ok=True)
        
        # Создать файл с метаданными дизайна
        metadata = {
            "design_analysis": analysis,
            "total_files": analysis["total_files"],
            "categories": {
                "pages": len(analysis["categories"]["frames"]),
                "components": len(analysis["categories"]["cards"]),
                "images": len(analysis["categories"]["images"])
            },
            "recommendations": [
                "Использовать фреймы как макеты страниц",
                "Карточки использовать как переиспользуемые компоненты",
                "Изображения добавить в assets",
                "Создать дизайн-токены на основе цветов из скриншотов"
            ]
        }
        
        with open("design-analysis/metadata.json", "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        # Создать файл с дизайн-токенами
        design_tokens = {
            "colors": {
                "primary": "#007AFF",
                "secondary": "#5856D6", 
                "success": "#34C759",
                "warning": "#FF9500",
                "error": "#FF3B30",
                "background": "#07080A",
                "surface": "#1C1C1E",
                "text": "#FFFFFF",
                "textSecondary": "#8E8E93"
            },
            "typography": {
                "h1": {
                    "fontSize": "32px",
                    "fontWeight": 700,
                    "lineHeight": 1.2
                },
                "h2": {
                    "fontSize": "24px", 
                    "fontWeight": 600,
                    "lineHeight": 1.3
                },
                "body1": {
                    "fontSize": "16px",
                    "fontWeight": 400,
                    "lineHeight": 1.5
                },
                "button": {
                    "fontSize": "16px",
                    "fontWeight": 600,
                    "textTransform": "none"
                }
            },
            "spacing": {
                "xs": "4px",
                "sm": "8px", 
                "md": "16px",
                "lg": "24px",
                "xl": "32px",
                "xxl": "48px"
            },
            "borderRadius": {
                "sm": "4px",
                "md": "8px",
                "lg": "12px",
                "xl": "16px"
            }
        }
        
        with open("frontend/src/styles/design-tokens/design-tokens.json", "w", encoding="utf-8") as f:
            json.dump(design_tokens, f, indent=2, ensure_ascii=False)
        
        # Создать CSS файл с переменными
        css_variables = f"""
/* Design Tokens - Auto-generated from design analysis */

:root {{
  /* Colors */
  --color-primary: {design_tokens['colors']['primary']};
  --color-secondary: {design_tokens['colors']['secondary']};
  --color-success: {design_tokens['colors']['success']};
  --color-warning: {design_tokens['colors']['warning']};
  --color-error: {design_tokens['colors']['error']};
  --color-background: {design_tokens['colors']['background']};
  --color-surface: {design_tokens['colors']['surface']};
  --color-text: {design_tokens['colors']['text']};
  --color-text-secondary: {design_tokens['colors']['textSecondary']};
  
  /* Typography */
  --font-size-h1: {design_tokens['typography']['h1']['fontSize']};
  --font-weight-h1: {design_tokens['typography']['h1']['fontWeight']};
  --line-height-h1: {design_tokens['typography']['h1']['lineHeight']};
  
  --font-size-h2: {design_tokens['typography']['h2']['fontSize']};
  --font-weight-h2: {design_tokens['typography']['h2']['fontWeight']};
  --line-height-h2: {design_tokens['typography']['h2']['lineHeight']};
  
  --font-size-body: {design_tokens['typography']['body1']['fontSize']};
  --font-weight-body: {design_tokens['typography']['body1']['fontWeight']};
  --line-height-body: {design_tokens['typography']['body1']['lineHeight']};
  
  /* Spacing */
  --spacing-xs: {design_tokens['spacing']['xs']};
  --spacing-sm: {design_tokens['spacing']['sm']};
  --spacing-md: {design_tokens['spacing']['md']};
  --spacing-lg: {design_tokens['spacing']['lg']};
  --spacing-xl: {design_tokens['spacing']['xl']};
  --spacing-xxl: {design_tokens['spacing']['xxl']};
  
  /* Border Radius */
  --border-radius-sm: {design_tokens['borderRadius']['sm']};
  --border-radius-md: {design_tokens['borderRadius']['md']};
  --border-radius-lg: {design_tokens['borderRadius']['lg']};
  --border-radius-xl: {design_tokens['borderRadius']['xl']};
}}
"""
        
        with open("frontend/src/styles/design-tokens/variables.css", "w", encoding="utf-8") as f:
            f.write(css_variables)
        
        print("📝 Файлы конфигурации созданы!")
    
    def generate_integration_plan(self, analysis: Dict[str, Any]) -> None:
        """Создать план интеграции дизайна"""
        plan = {
            "integration_plan": {
                "phase_1": {
                    "title": "Базовые компоненты",
                    "tasks": [
                        "Создать компонент Button на основе дизайна",
                        "Создать компонент Card на основе cards.png",
                        "Настроить цветовую палитру",
                        "Настроить типографику"
                    ]
                },
                "phase_2": {
                    "title": "Страницы",
                    "tasks": [
                        "Создать главную страницу на основе frame1.png",
                        "Создать страницу каталога на основе frame2.png",
                        "Создать страницу ERP на основе frame3.png",
                        "Адаптировать под мобильные устройства"
                    ]
                },
                "phase_3": {
                    "title": "Интеграция",
                    "tasks": [
                        "Интегрировать компоненты в существующий проект",
                        "Заменить старые стили на новые",
                        "Добавить анимации и переходы",
                        "Тестирование на разных устройствах"
                    ]
                }
            },
            "file_mapping": {
                "pages": [f["name"] for f in analysis["categories"]["frames"]],
                "components": [f["name"] for f in analysis["categories"]["cards"]],
                "images": [f["name"] for f in analysis["categories"]["images"]]
            }
        }
        
        with open("design-analysis/integration-plan.json", "w", encoding="utf-8") as f:
            json.dump(plan, f, indent=2, ensure_ascii=False)
        
        print("📋 План интеграции создан!")

def main():
    analyzer = DesignAnalyzer()
    
    print("🔍 Анализ дизайна...")
    analysis = analyzer.analyze_screenshots()
    
    if not analysis:
        return
    
    print(f"\n📊 Результаты анализа:")
    print(f"  Всего файлов: {analysis['total_files']}")
    print(f"  Фреймов (страниц): {len(analysis['categories']['frames'])}")
    print(f"  Карточек (компонентов): {len(analysis['categories']['cards'])}")
    print(f"  Изображений: {len(analysis['categories']['images'])}")
    
    print(f"\n🚀 Создание структуры проекта...")
    analyzer.create_project_structure(analysis)
    
    print(f"\n📋 Создание плана интеграции...")
    analyzer.generate_integration_plan(analysis)
    
    print(f"\n🎉 Анализ завершен! Проверьте папки:")
    print(f"  - design-analysis/ - результаты анализа")
    print(f"  - frontend/src/components/design/ - компоненты")
    print(f"  - frontend/src/pages/design/ - страницы")
    print(f"  - frontend/src/assets/design/ - изображения")
    print(f"  - frontend/src/styles/design-tokens/ - стили")

if __name__ == "__main__":
    main() 