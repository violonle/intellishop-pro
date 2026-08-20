#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量为HTML页面添加全局CSS引用的脚本
"""

import os
import re
from pathlib import Path

def add_global_css_to_html(file_path, css_path_relative):
    """为HTML文件添加全局CSS引用"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已经包含了global-styles.css
        if 'global-styles.css' in content:
            print(f"跳过 {file_path} - 已包含全局CSS")
            return False
        
        # 查找title标签后的位置来插入CSS链接
        title_pattern = r'(<title>.*?</title>)'
        css_link = f'    <link rel="stylesheet" href="{css_path_relative}">'
        
        if re.search(title_pattern, content, re.DOTALL):
            # 在title标签后插入CSS链接
            new_content = re.sub(
                title_pattern,
                r'\1\n' + css_link,
                content,
                flags=re.DOTALL
            )
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✅ 已添加全局CSS到: {file_path}")
            return True
        else:
            print(f"⚠️  未找到title标签: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ 处理文件失败 {file_path}: {e}")
        return False

def remove_duplicate_scrollbar_styles(file_path):
    """移除重复的滚动条样式"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 移除重复的scrollbar-hide样式
        patterns_to_remove = [
            r'\.scrollbar-hide::-webkit-scrollbar\s*\{[^}]*\}',
            r'\.scrollbar-hide\s*\{[^}]*scrollbar-width[^}]*\}',
            r'::-webkit-scrollbar\s*\{[^}]*\}',
            r'::-webkit-scrollbar-track\s*\{[^}]*\}',
            r'::-webkit-scrollbar-thumb\s*\{[^}]*\}'
        ]
        
        modified = False
        for pattern in patterns_to_remove:
            if re.search(pattern, content, re.DOTALL):
                content = re.sub(pattern, '', content, flags=re.DOTALL)
                modified = True
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"🧹 已清理重复样式: {file_path}")
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ 清理样式失败 {file_path}: {e}")
        return False

def main():
    """主函数"""
    base_dir = Path(__file__).parent
    pages_dir = base_dir / 'pages'
    
    # 需要处理的HTML文件列表
    html_files = []
    
    # 添加pages目录下的HTML文件
    if pages_dir.exists():
        html_files.extend(pages_dir.glob('*.html'))
    
    # 添加根目录下的主要HTML文件
    root_html_files = [
        'index.html', 'login.html', 'login-phone.html', 'register.html',
        'main-app.html', 'phone.html', 'verification.html', 'splash.html'
    ]
    
    for filename in root_html_files:
        file_path = base_dir / filename
        if file_path.exists():
            html_files.append(file_path)
    
    print(f"找到 {len(html_files)} 个HTML文件需要处理")
    
    success_count = 0
    cleaned_count = 0
    
    for html_file in html_files:
        # 确定CSS文件的相对路径
        if html_file.parent.name == 'pages':
            css_relative_path = '../assets/global-styles.css'
        else:
            css_relative_path = 'assets/global-styles.css'
        
        # 添加全局CSS引用
        if add_global_css_to_html(html_file, css_relative_path):
            success_count += 1
        
        # 清理重复的滚动条样式
        if remove_duplicate_scrollbar_styles(html_file):
            cleaned_count += 1
    
    print(f"\n📊 处理完成:")
    print(f"✅ 成功添加全局CSS: {success_count} 个文件")
    print(f"🧹 清理重复样式: {cleaned_count} 个文件")
    print(f"📁 总处理文件数: {len(html_files)} 个")

if __name__ == '__main__':
    main()