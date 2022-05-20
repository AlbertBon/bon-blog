---
icon: edit
date: 2022-05-17
category:
  - linux
tag:
  - linux
---

# vim 使用

## vim安装

```shell script
yum -y install vim 
```

## vim 使用

### 全选，全部复制，全部删除
* 全选（高亮显示）：按esc后，然后ggvG或者ggVG
* 全部复制：按esc后，然后ggyG
* 全部删除：按esc后，然后dG
### 解析
```text
gg：是让光标移到首行，在vim才有效，vi中无效 
v ： 是进入Visual(可视）模式 
G ：光标移到最后一行 

选中内容以后就可以其他的操作了，比如： 
d  删除选中内容 
y  复制选中内容到0号寄存器 
"+y  复制选中内容到＋寄存器，也就是系统的剪贴板，供其他程序用
```
