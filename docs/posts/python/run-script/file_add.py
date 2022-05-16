import time, os


def add(file, add_str):
    file_data = add_str
    with open(file, "r", encoding="utf-8") as f:
        for line in f:
            file_data += line
    with open(file, "w", encoding="utf-8") as f:
        f.write(file_data)
        f.close()


def add_blog_title(file):
    dir_name = os.path.basename(os.path.abspath(os.path.abspath(file)))
    data = '''---
icon: eidt
date: ''' + str(time.strftime("%Y-%m-%d", time.localtime())) + '''
category:
  - ''' + dir_name + '''
tag:
  - ''' + dir_name + '''
---

    '''
    add('./test.txt', data)
