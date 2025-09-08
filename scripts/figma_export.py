#!/usr/bin/env python3
"""
Figma API Export Script
Экспорт дизайна из Figma в локальные файлы
"""

import requests
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Any
import time

class FigmaExporter:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://api.figma.com/v1"
        self.headers = {
            "X-Figma-Token": access_token,
            "Content-Type": "application/json"
        }
        
    def get_user_info(self) -> Dict[str, Any]:
        """Получить информацию о пользователе"""
        try:
            response = requests.get(f"{self.base_url}/me", headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка получения информации о пользователе: {e}")
            return {}
    
    def get_files(self) -> List[Dict[str, Any]]:
        """Получить список файлов пользователя"""
        try:
            response = requests.get(f"{self.base_url}/me/files", headers=self.headers)
            response.raise_for_status()
            return response.json().get("files", [])
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка получения списка файлов: {e}")
            return []
    
    def get_file_info(self, file_key: str) -> Dict[str, Any]:
        """Получить информацию о файле"""
        try:
            response = requests.get(f"{self.base_url}/files/{file_key}", headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка получения информации о файле {file_key}: {e}")
            return {}
    
    def get_image_urls(self, file_key: str, node_ids: List[str], format: str = "png", scale: int = 2) -> Dict[str, str]:
        """Получить URL изображений для экспорта"""
        try:
            params = {
                "ids": ",".join(node_ids),
                "format": format,
                "scale": scale
            }
            response = requests.get(f"{self.base_url}/images/{file_key}", headers=self.headers, params=params)
            response.raise_for_status()
            return response.json().get("images", {})
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка получения URL изображений: {e}")
            return {}
    
    def download_image(self, url: str, filepath: str) -> bool:
        """Скачать изображение по URL"""
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка скачивания изображения {url}: {e}")
            return False
    
    def extract_nodes(self, node: Dict[str, Any], nodes: List[Dict[str, Any]]) -> None:
        """Рекурсивно извлечь все узлы из документа"""
        if node.get("type") in ["FRAME", "COMPONENT", "INSTANCE", "GROUP"]:
            nodes.append(node)
        
        # Рекурсивно обработать дочерние элементы
        for child in node.get("children", []):
            self.extract_nodes(child, nodes)
    
    def sanitize_filename(self, filename: str) -> str:
        """Очистить имя файла от недопустимых символов"""
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        return filename.strip()
    
    def export_file(self, file_key: str, output_dir: str = "./figma-export") -> bool:
        """Экспортировать файл Figma"""
        print(f"🔄 Экспорт файла {file_key}...")
        
        # Получить информацию о файле
        file_info = self.get_file_info(file_key)
        if not file_info:
            return False
        
        # Создать структуру папок
        base_dir = Path(output_dir)
        base_dir.mkdir(exist_ok=True)
        
        (base_dir / "pages").mkdir(exist_ok=True)
        (base_dir / "components").mkdir(exist_ok=True)
        (base_dir / "icons").mkdir(exist_ok=True)
        (base_dir / "images").mkdir(exist_ok=True)
        (base_dir / "styles").mkdir(exist_ok=True)
        
        # Извлечь все узлы
        nodes = []
        document = file_info.get("document", {})
        self.extract_nodes(document, nodes)
        
        print(f"📊 Найдено {len(nodes)} узлов для экспорта")
        
        # Экспортировать узлы
        exported_count = 0
        for i, node in enumerate(nodes):
            node_id = node.get("id")
            node_name = node.get("name", f"node_{i}")
            node_type = node.get("type", "unknown")
            
            # Определить папку назначения
            if node_type in ["COMPONENT", "INSTANCE"]:
                folder = "components"
            elif node_type == "FRAME":
                folder = "pages"
            else:
                folder = "images"
            
            # Получить URL изображения
            image_urls = self.get_image_urls(file_key, [node_id])
            if node_id in image_urls:
                url = image_urls[node_id]
                
                # Создать имя файла
                filename = self.sanitize_filename(f"{node_name}.png")
                filepath = base_dir / folder / filename
                
                # Скачать изображение
                if self.download_image(url, str(filepath)):
                    print(f"✅ Экспортирован: {folder}/{filename}")
                    exported_count += 1
                else:
                    print(f"❌ Ошибка экспорта: {node_name}")
            
            # Небольшая задержка чтобы не перегружать API
            time.sleep(0.1)
        
        # Сохранить метаданные
        metadata = {
            "file_key": file_key,
            "file_name": file_info.get("name", "Unknown"),
            "exported_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_nodes": len(nodes),
            "exported_count": exported_count
        }
        
        with open(base_dir / "metadata.json", "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        print(f"🎉 Экспорт завершен! Экспортировано {exported_count} из {len(nodes)} узлов")
        return True

def main():
    # Токен из конфигурации
    access_token = "figd_PW2JpX5EjL9zyApUBnCZ3qzAILJoY1PbPkoeuOpU"
    
    # Создать экспортер
    exporter = FigmaExporter(access_token)
    
    # Получить информацию о пользователе
    user_info = exporter.get_user_info()
    if user_info:
        print(f"👤 Пользователь: {user_info.get('handle', 'Unknown')}")
        print(f"📧 Email: {user_info.get('email', 'Unknown')}")
    
    # Получить список файлов
    files = exporter.get_files()
    if not files:
        print("❌ Не удалось получить список файлов")
        return
    
    print(f"\n📁 Найдено {len(files)} файлов:")
    for i, file_info in enumerate(files):
        print(f"  {i+1}. {file_info.get('name', 'Unknown')} (ключ: {file_info.get('key', 'Unknown')})")
    
    # Если передан ключ файла как аргумент
    if len(sys.argv) > 1:
        file_key = sys.argv[1]
        print(f"\n🚀 Экспорт файла {file_key}...")
        exporter.export_file(file_key)
    else:
        # Показать меню выбора
        print("\nВыберите файл для экспорта (или введите ключ файла):")
        try:
            choice = input("Введите номер файла или ключ: ").strip()
            
            # Проверить, является ли ввод ключом файла
            if len(choice) > 10:  # Предполагаем, что это ключ файла
                file_key = choice
            else:
                # Это номер файла
                file_index = int(choice) - 1
                if 0 <= file_index < len(files):
                    file_key = files[file_index]["key"]
                else:
                    print("❌ Неверный номер файла")
                    return
            
            exporter.export_file(file_key)
            
        except (ValueError, KeyboardInterrupt):
            print("\n❌ Отменено пользователем")

if __name__ == "__main__":
    main() 