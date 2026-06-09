---
title: "算法笔记：两数之和"
date: 2026-06-05
description: "LeetCode 第一题题解。"
category: "算法"
tags: ["LeetCode", "哈希表"]
---

## 思路

用哈希表记录已遍历的数。

```python
def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
```

## 复杂度

时间 O(n)，空间 O(n)。
