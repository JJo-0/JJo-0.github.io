
# 시각화
plt.figure(figsize=(8, 6))
scatter = plt.scatter(df_pca[:, 0], df_pca[:, 1], c=df_all['Sensor'], cmap='viridis')
plt.xlabel('PCA Feature 1')
plt.ylabel('PCA Feature 2')
plt.title('2-d visualization of PCA')
plt.legend(handles=scatter.legend_elements()[0], labels=sensor_dict.keys())
plt.show()