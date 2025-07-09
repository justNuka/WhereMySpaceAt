module.exports = [
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          ['@babel/preset-env'],
          ['@babel/preset-react', { runtime: 'automatic' }]
        ]
      },
    },
  },
  {
    test: /\.(ts|tsx)$/,
    exclude: /node_modules/,
    use: 'ts-loader',
  },
  {
    test: /\.css$/,
    use: ['style-loader', 'css-loader', 'postcss-loader'],
  },
  {
    test: /\.(png|jpe?g|gif|svg)$/i,
    type: 'asset/resource',
  },
];
