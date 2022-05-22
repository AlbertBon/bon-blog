---
icon: book
date: 2022-05-12
category:
  - linux
tag:
  - linux
---

# 清理缓存

## 查看缓存及清理缓存

```shell script
#查看缓存的命令
free -m
#清理缓存的命令

#echo 0 是不释放缓存
echo 0 > /proc/sys/vm/drop_caches

#echo 1 是释放页缓存
echo 1 > /proc/sys/vm/drop_caches

# ehco 2 是释放dentries和inodes缓存
echo 2 > /proc/sys/vm/drop_caches

# echo 3 是释放 1 和 2 中说道的的所有缓存
echo 3 > /proc/sys/vm/drop_caches

```


