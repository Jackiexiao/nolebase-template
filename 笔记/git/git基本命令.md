---
share: "true"
---

## git 流程图![Pasted image 20250909161347](../img/Pasted%20image%2020250909161347.png)

## 设置用户信息(注意空格)
```
	git config --global user.name "名字"
	git config user.email "邮箱"
```
## 查看配置信息
```
	git config --global user.name
	git config --global user.email
```

## 创建仓库 git init


![Pasted image 20250909165611](../img/Pasted%20image%2020250909165611.png)

## 添加到暂存区
```
	git add 文件名
	git add . %% 将所有文件添加到暂存区 %%
```

## 添加到仓库
```
	git commit -m "注释"
```

## 查看修改的状态
```
	git status
```

## 查看项目的提交历史
```
	git log
	git log [option]
		--all %% 显示所有分支 %%
		--pretty=oneline %% 将提交的信息显示为一行 %%
		--abbrev-commit %% 使得输出的commitld更简短 %%
		--graph %% 以图的形式显示 %%
```

## 版本控制
```
	git reset --hard commitID %% commitID可以使用git-log或 git log指令查看 %%
	git reflog %% 查看已经删除的提交记录 %%
```

## 不使用git管理
```
	touch .gitignore %% 将不需要管理的文件写到文件里面 %%
```


## 提交到服务器
```
	git push -u origin "master"
```

## 如果你是想**更正**或**更改**当前 `origin` 指向的仓库地址（比如你复制错了，或者想换一个仓库），使用这个命令
```
	git remote set-url origin https://github.com/fenglingyubing/studyNote.git
```