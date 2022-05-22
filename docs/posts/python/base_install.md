---
icon: book
date: 2022-05-17
category:
  - python
tag:
  - python
---


# python基础安装与卸载
## centos卸载自带的python 2.x
```shell script
# 卸载
rpm -qa|grep python|xargs rpm -ev --allmatches --nodeps
# 清除残余文件
whereis python |xargs rm -frv
# 验证
whereis python
```
## 安装Python3.9.0



