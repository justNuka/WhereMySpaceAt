import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const SpaceChart = ({ data }) => {
  if (!data) {
    return (
      <div className="glass-morphism-dark rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Space Distribution</h2>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">No data to display</p>
        </div>
      </div>
    );
  }

  // Prepare data for chart (top 10 largest items)
  const items = [];
  
  const collectItems = (item) => {
    items.push({
      name: item.name,
      size: item.size,
      type: item.type
    });
    
    if (item.children) {
      item.children.forEach(collectItems);
    }
  };
  
  if (data.children) {
    data.children.forEach(collectItems);
  }
  
  // Sort by size and take top 10
  const topItems = items
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
  
  const labels = topItems.map(item => {
    const name = item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name;
    return `${name} (${window.formatSize(item.size)})`;
  });
  
  const sizes = topItems.map(item => item.size);
  const colors = window.CONSTANTS.CHART_COLORS.slice(0, topItems.length);
  
  const chartData = {
    labels: labels,
    datasets: [{
      data: sizes,
      backgroundColor: colors,
      borderColor: colors.map(color => color.replace('0.8', '1')),
      borderWidth: 2,
      hoverBorderWidth: 3
    }]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#D1D5DB',
          font: {
            size: 12
          },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FFFFFF',
        bodyColor: '#D1D5DB',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const item = topItems[context.dataIndex];
            const percentage = ((item.size / data.size) * 100).toFixed(1);
            return `${window.formatSize(item.size)} (${percentage}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2
      }
    }
  };

  return (
    <div className="glass-morphism-dark rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-semibold text-white mb-4">Space Distribution</h2>
      <div className="h-64 relative">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
      
      <div className="mt-4 glass-morphism border border-white/20 rounded-lg p-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">
            {window.formatSize(data.size)}
          </p>
          <p className="text-sm text-gray-300">Total Size</p>
        </div>
      </div>
    </div>
  );
};

export default SpaceChart;
