# Tags-based Recommendation System

## 功能概述

新增了基于tags的推荐系统，可以根据用户watchlist中的商品标签来推荐相似的拍卖商品。

## 新增API端点

### 1. 获取用户感兴趣的标签
```
GET /tag/user-interests
```
- **描述**: 获取基于用户watchlist的感兴趣标签列表
- **需要登录**: 是
- **返回**: 用户感兴趣的标签及其使用频次

### 2. 获取基于标签的推荐
```
GET /tag/recommendations?limit=10
```
- **描述**: 基于用户感兴趣的标签推荐相关商品
- **参数**: 
  - `limit` (可选): 返回结果数量限制，默认10
- **需要登录**: 是
- **返回**: 推荐的拍卖商品列表，包含匹配标签信息

### 3. 获取特定拍卖的标签
```
GET /tag/auction/:auctionId
```
- **描述**: 获取指定拍卖商品的所有标签
- **参数**: 
  - `auctionId`: 拍卖商品ID
- **需要登录**: 否
- **返回**: 该拍卖商品的标签列表

### 4. 获取综合推荐
```
GET /watchlist/recommendations/comprehensive?limit=20
```
- **描述**: 结合类别和标签的综合推荐
- **参数**: 
  - `limit` (可选): 返回结果数量限制，默认20
- **需要登录**: 是
- **返回**: 综合推荐结果，包含推荐类型标识

## 推荐算法说明

### 标签推荐算法
1. **用户兴趣分析**: 分析用户watchlist中商品的标签，统计标签使用频次
2. **相似度计算**: 找到包含相同标签的其他商品
3. **排序策略**: 
   - 按匹配标签数量排序（优先级最高）
   - 按商品热度（出价次数）排序
   - 按结束时间排序

### 综合推荐算法
1. **多重策略**: 60%基于类别推荐 + 40%基于标签推荐
2. **去重处理**: 自动去除重复商品
3. **类型标识**: 每个推荐结果都标明是基于类别还是标签

## 数据库查询优化

### 新增函数

#### tagModel.js
- `getUserInterestedTags(buyerId)`: 获取用户感兴趣标签
- `getTagBasedRecommendations(buyerId, limit)`: 基于标签的推荐
- `getTagsForAuction(auctionId)`: 获取拍卖商品标签

#### watchlistController.js
- `handleGetComprehensiveRecommendations()`: 综合推荐控制器

## 使用示例

### 前端调用示例
```javascript
// 获取用户感兴趣的标签
fetch('/tag/user-interests', {
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log(data.tags));

// 获取基于标签的推荐
fetch('/tag/recommendations?limit=5', {
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log(data.recommendations));

// 获取综合推荐
fetch('/watchlist/recommendations/comprehensive?limit=15', {
  credentials: 'include'
})
.then(response => response.json())
.then(data => {
  console.log('总推荐:', data.recommendations);
  console.log('类别推荐数:', data.category_count);
  console.log('标签推荐数:', data.tag_count);
});
```

## 测试

运行测试文件来验证功能：
```bash
cd backend
node test-tag-recommendations.js
```

## 注意事项

1. **性能优化**: 使用了复杂的CTE查询，建议在数据库中添加适当索引
2. **权限控制**: 所有推荐相关API都需要用户登录
3. **数据完整性**: 确保auction_listing_tags表有正确的外键关系
4. **扩展性**: 算法可根据实际使用情况调整权重和排序策略
