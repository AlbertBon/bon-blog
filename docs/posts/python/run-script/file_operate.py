import time, os
from tkinter import filedialog


# 为文件添加字符串
def add(file, add_str):
    file_data = add_str
    with open(file, "r", encoding="utf-8") as f:
        for line in f:
            file_data += line
    with open(file, "w", encoding="utf-8") as f:
        f.write(file_data)
        f.close()


# 为博客文件添加文件头
def add_blog_title(file):
    dir_name = os.path.basename(os.path.dirname(os.path.abspath(file)))

    content = open(file,'r',encoding='utf-8').read()
    if not content.startswith('---'):
        data = '''---
icon: book
date: ''' + str(time.strftime("%Y-%m-%d", time.localtime())) + '''
category:
  - ''' + dir_name + '''
tag:
  - ''' + dir_name + '''
---

'''
        add(file, data)


# 为博客文件夹下的文件添加文件头
def add_blog_title_dir(url):
    # 遍历当前路径下所有文件
    file = os.listdir(url)
    for f in file:
        # 文件信息
        real_url = url + '/' + f
        file_name = os.path.basename(f)
        if file_name.endswith('.md'):
            # 打印出来
            print('为==%s==生成头部' % file_name)
            # 添加头部
            add_blog_title(real_url)
    print('done')


# 删除文件前面几行
def del_line(file, n):
    file_data = ''
    with open(file, "r", encoding="utf-8") as f:
        count = 0
        for line in f:
            count = count + 1
            if count > n:
                file_data += line
    with open(file, "w", encoding="utf-8") as f:
        f.write(file_data)
        f.close()


# 为博客文件夹下的文件删除固定行数
def del_blog_title_dir(url, num):
    # 遍历当前路径下所有文件
    file = os.listdir(url)
    for f in file:
        # 文件信息
        real_url = url + '/' + f
        file_name = os.path.basename(f)
        if file_name.endswith('.md'):
            # 打印出来
            print('为==%s==删除%d行' % (file_name,num))
            # 删除文件前面 n 行
            del_line(real_url, num)
    print('done')


# 替换文件内容
def replace_file(file, o_str, n_str):
    file_data = ''
    with open(file, "r", encoding="utf-8") as f:
        for line in f:
            file_data += line.replace(o_str, n_str)
    with open(file, "w", encoding="utf-8") as f:
        f.write(file_data)
        f.close()


# 替换文件夹下所有文件的字符串
def replace_file_dir(dir_url, o_str, n_str):
    files = os.listdir(dir_url)
    for file in files:
        real_url = dir_url + '/' + file
        if file.endswith('.md'):
            # 打印出来
            print('为==%s==替换内容' % os.path.basename(real_url))
            replace_file(real_url, o_str, n_str)


# 选择文件夹路径
def select_dir_path() -> str: return filedialog.askdirectory()


# 选择文件路径
def select_file_path() -> str: return filedialog.asksaveasfilename()
