// ─── Navbar ───────────────────────────────────────────────
export const navT = {
  en: {
    links: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Datasets', href: '/datasets' },
      { label: 'Guide', href: '/guide' },
    ],
    cta: 'Explore Data',
  },
  zh: {
    links: [
      { label: '首页', href: '/' },
      { label: '关于', href: '/about' },
      { label: '数据集', href: '/datasets' },
      { label: '使用指南', href: '/guide' },
    ],
    cta: '浏览数据',
  },
};

// ─── Hero ─────────────────────────────────────────────────
export const heroT = {
  en: {
    badge: 'Real-Robot RL Data Platform',
    title1: 'The Data',
    title2: 'Foundation',
    title3: 'for Real-Robot RL',
    subtitle:
      'Discover, access, and contribute high-quality real-robot reinforcement learning datasets. Accelerate sim-to-real transfer and on-robot policy training with standardized, curated data.',
    stats: [
      { value: '6+', label: 'Datasets' },
      { value: '4M+', label: 'Trajectories' },
      { value: '1.3TB', label: 'Data Volume' },
      { value: '200+', label: 'Tasks' },
    ],
    cta1: 'Explore Datasets',
    cta2: 'View Demo',
    scroll: 'Scroll',
  },
  zh: {
    badge: '真机强化学习数据平台',
    title1: '真机强化学习',
    title2: '数据基础设施',
    title3: '加速机器人研究',
    subtitle:
      '发现、获取并贡献高质量的真机强化学习数据集。以标准化、精心策划的数据加速 Sim-to-Real 迁移与机器人在线策略训练。',
    stats: [
      { value: '6+', label: '数据集' },
      { value: '4M+', label: '轨迹数' },
      { value: '1.3TB', label: '数据量' },
      { value: '200+', label: '任务数' },
    ],
    cta1: '浏览数据集',
    cta2: '查看演示',
    scroll: '向下滚动',
  },
};

// ─── Home Page ────────────────────────────────────────────
export const homeT = {
  en: {
    featuresBadge: 'Platform Capabilities',
    featuresTitle: 'Everything You Need for ',
    featuresTitleHighlight: 'Real-Robot RL',
    featuresSubtitle:
      'A unified platform designed specifically for real-robot reinforcement learning data — from collection to training.',
    features: [
      {
        title: 'Large-Scale Dataset Hosting',
        description:
          'Store and serve real-robot trajectory datasets from gigabytes to terabytes with optimized delivery pipelines and Alibaba Cloud OSS backend.',
      },
      {
        title: 'Real-Robot RL Data Support',
        description:
          'Native support for RLDS, HDF5, and ROS Bag formats. Designed for on-robot data collection and sim-to-real transfer workflows.',
      },
      {
        title: 'Efficient Data Pipeline',
        description:
          'Stream datasets directly into your RL training scripts. Compatible with TensorFlow Datasets, PyTorch DataLoader, and LeRobot.',
      },
      {
        title: 'Trajectory Visualization',
        description:
          'Explore robot trajectories, joint states, reward signals, and sensor readings with interactive visualization tools in your browser.',
      },
      {
        title: 'Open & Standardized',
        description:
          'All datasets follow standardized metadata schemas. Clear licensing (CC BY, MIT, Apache) for academic research and commercial use.',
      },
      {
        title: 'Community Driven',
        description:
          'Upload your own real-robot datasets, submit benchmarks, and collaborate with the global robot learning research community.',
      },
    ],
    datasetsBadge: 'Featured Datasets',
    datasetsTitle: 'Curated ',
    datasetsTitleHighlight: 'Real-Robot',
    datasetsTitleSuffix: ' RL Datasets',
    datasetsSubtitle:
      'Explore our growing collection of real-robot reinforcement learning datasets, from dexterous manipulation to legged locomotion.',
    viewAll: 'View All Datasets',
    visionBadge: 'Platform Vision',
    visionTitle: 'Bridging the ',
    visionTitleHighlight: 'Sim-to-Real',
    visionTitleSuffix: ' Gap with Data',
    visionDesc:
      'Real-robot data scarcity is one of the biggest bottlenecks in robot learning research. EvoData provides a unified, standardized, and accessible platform to accelerate on-robot RL by making high-quality real-world trajectory data freely available.',
    visionPoints: [
      'Standardized real-robot trajectory formats (RLDS / HDF5 / ROS Bag)',
      'One-click dataset access from RL training scripts',
      'Community-driven data curation and benchmarks',
      'Future: real-time upload, streaming and on-robot data collection tools',
    ],
    visionLink: 'Learn More About Our Roadmap',
    demoPlaceholder: 'Demo video coming soon',
    ctaTitle: 'Ready to ',
    ctaTitleHighlight: 'Explore?',
    ctaSubtitle:
      'Browse our curated collection of real-robot RL datasets and start accelerating your research today.',
    ctaBtn1: 'Browse Datasets',
    ctaBtn2: 'About the Project',
  },
  zh: {
    featuresBadge: '平台能力',
    featuresTitle: '真机强化学习研究所需的',
    featuresTitleHighlight: '一切',
    featuresSubtitle: '专为真机强化学习数据设计的统一平台 —— 从数据采集到模型训练，一站式支持。',
    features: [
      {
        title: '大规模数据集托管',
        description: '支持从 GB 到 TB 级别的真机轨迹数据集存储与分发，依托阿里云 OSS 后端提供高速访问。',
      },
      {
        title: '真机 RL 数据原生支持',
        description: '原生支持 RLDS、HDF5、ROS Bag 等格式，专为真机数据采集与 Sim-to-Real 迁移工作流设计。',
      },
      {
        title: '高效数据管线',
        description: '直接将数据集流式传输至 RL 训练脚本，兼容 TensorFlow Datasets、PyTorch DataLoader 和 LeRobot。',
      },
      {
        title: '轨迹可视化',
        description: '在浏览器中交互式探索机器人轨迹、关节状态、奖励信号和传感器数据。',
      },
      {
        title: '开放与标准化',
        description: '所有数据集遵循统一的元数据规范，提供清晰的开源许可（CC BY、MIT、Apache），支持学术与商业使用。',
      },
      {
        title: '社区驱动',
        description: '上传您自己的真机数据集、提交基准测试，与全球机器人学习研究社区共同协作。',
      },
    ],
    datasetsBadge: '精选数据集',
    datasetsTitle: '精心策划的',
    datasetsTitleHighlight: '真机强化学习',
    datasetsTitleSuffix: '数据集',
    datasetsSubtitle: '探索我们不断增长的真机强化学习数据集合，从灵巧操作到足式机器人运动，应有尽有。',
    viewAll: '查看全部数据集',
    visionBadge: '平台愿景',
    visionTitle: '用数据弥合',
    visionTitleHighlight: 'Sim-to-Real',
    visionTitleSuffix: '鸿沟',
    visionDesc:
      '真机数据的匮乏是机器人学习研究面临的最大瓶颈之一。EvoData 提供统一、标准化且易于访问的平台，通过开放高质量真实世界轨迹数据，加速真机强化学习的研究进程。',
    visionPoints: [
      '标准化的真机轨迹格式（RLDS / HDF5 / ROS Bag）',
      '一键从 RL 训练脚本访问数据集',
      '社区驱动的数据策划与基准测试',
      '未来：实时上传、流式传输与真机数据采集工具',
    ],
    visionLink: '了解更多路线图',
    demoPlaceholder: '演示视频即将上线',
    ctaTitle: '准备好开始',
    ctaTitleHighlight: '探索了吗？',
    ctaSubtitle: '浏览我们精心整理的真机 RL 数据集，立即加速您的研究。',
    ctaBtn1: '浏览数据集',
    ctaBtn2: '关于项目',
  },
};

// ─── About Page ───────────────────────────────────────────
export const aboutT = {
  en: {
    headerBadge: 'About the Project',
    headerTitle1: 'Building the ',
    headerTitleHighlight: 'Data Foundation',
    headerTitle2: 'for Real-Robot RL',
    headerDesc:
      'EvoData is an open data platform developed at MINT Lab, SJTU. Our mission is to democratize access to high-quality real-robot reinforcement learning datasets and accelerate the development of intelligent embodied systems.',
    problemBadge: 'The Problem',
    problemTitle: 'Why Does This Platform Exist?',
    problemDesc:
      'Real-robot reinforcement learning faces unique data challenges that existing platforms are not designed to address.',
    problems: [
      {
        title: 'Real-Robot Data Scarcity',
        description:
          'High-quality real-robot trajectory data is extremely scarce and expensive to collect, creating a significant barrier for RL research.',
      },
      {
        title: 'Difficult Access',
        description:
          'Existing datasets are scattered across institutions with inconsistent access methods, making reproducibility a challenge.',
      },
      {
        title: 'Lack of Standardization',
        description:
          'Incompatible formats and metadata schemas force researchers to spend weeks on data wrangling instead of actual research.',
      },
    ],
    featuresBadge: 'Platform Features',
    featuresTitle: 'What EvoData Offers',
    featuresDesc:
      'A comprehensive data infrastructure platform purpose-built for real-robot reinforcement learning research.',
    capabilities: [
      'Standardized dataset hosting with unified metadata schema',
      'Support for RLDS, HDF5, ROS Bag, and other common formats',
      'Direct integration with popular RL training frameworks',
      'Built-in trajectory visualization and data exploration tools',
      'Versioned datasets with full provenance tracking',
      'Open licensing with clear terms for research and commercial use',
      'Community-driven dataset curation and quality control',
      'Benchmarking suite for policy evaluation on real robots',
    ],
    roadmapBadge: 'Development Roadmap',
    roadmapTitle: 'Building Towards a Full Platform',
    roadmapDesc:
      'From static showcase to a full-featured real-robot RL data ecosystem.',
    roadmap: [
      {
        title: 'Static Showcase',
        desc: 'Static website showcasing the platform vision, dataset previews, and project roadmap.',
        items: ['Landing page with platform overview', 'Dataset catalog with mock data', 'Design system & component library'],
      },
      {
        title: 'Dataset Browsing',
        desc: 'Full dataset browsing and search functionality with real data.',
        items: ['Real dataset metadata API', 'Full-text search & filtering', 'Dataset detail pages', 'Preview & visualization'],
      },
      {
        title: 'Upload & Download',
        desc: 'Enable the community to upload and download real-robot datasets with authentication.',
        items: ['User authentication system', 'Dataset upload pipeline', 'Chunked download with resume', 'Alibaba Cloud OSS integration'],
      },
      {
        title: 'Benchmark & Community',
        desc: 'Community features and policy evaluation benchmarks for real-robot RL.',
        items: ['Benchmark leaderboards', 'Community dataset contributions', 'Policy evaluation tools', 'API access tokens'],
      },
    ],
    teamBadge: 'Our Team',
    teamTitle: 'Built at MINT Lab, SJTU',
    teamDesc:
      'EvoData is developed by the MINT Lab at Shanghai Jiao Tong University, a research group focused on robot learning, manipulation intelligence, and embodied AI.',
    teamTags: ['Research-Driven', 'Open Source', 'Community First', 'SJTU MINT Lab'],
    statusLabels: { current: 'In Progress', upcoming: 'Upcoming', planned: 'Planned', future: 'Future' },
  },
  zh: {
    headerBadge: '关于项目',
    headerTitle1: '构建真机强化学习的',
    headerTitleHighlight: '数据基础设施',
    headerTitle2: '',
    headerDesc:
      'EvoData 是由上海交通大学 MINT 实验室开发的开放数据平台。我们的使命是让高质量真机强化学习数据集的获取变得更加民主化，并加速智能具身系统的发展。',
    problemBadge: '问题背景',
    problemTitle: '为什么需要这个平台？',
    problemDesc: '真机强化学习面临独特的数据挑战，而现有平台并非为此而设计。',
    problems: [
      {
        title: '真机数据稀缺',
        description: '高质量的真机轨迹数据极其稀缺且采集成本高昂，成为强化学习研究的重大障碍。',
      },
      {
        title: '访问困难',
        description: '现有数据集分散于各机构，访问方式不统一，使研究的可复现性面临巨大挑战。',
      },
      {
        title: '缺乏标准化',
        description: '格式与元数据规范不兼容，迫使研究人员花费大量时间在数据整理上，而非实际研究。',
      },
    ],
    featuresBadge: '平台特性',
    featuresTitle: 'EvoData 提供什么',
    featuresDesc: '专为真机强化学习研究构建的综合数据基础设施平台。',
    capabilities: [
      '统一元数据规范的标准化数据集托管',
      '支持 RLDS、HDF5、ROS Bag 等主流格式',
      '与主流 RL 训练框架直接集成',
      '内置轨迹可视化与数据探索工具',
      '带完整溯源追踪的版本化数据集',
      '清晰的开源许可，支持学术与商业使用',
      '社区驱动的数据集策划与质量管控',
      '真机策略评估基准测试套件',
    ],
    roadmapBadge: '开发路线图',
    roadmapTitle: '迈向完整平台',
    roadmapDesc: '从静态展示页到功能完整的真机 RL 数据生态系统。',
    roadmap: [
      {
        title: '静态展示',
        desc: '静态网站，展示平台愿景、数据集预览及项目路线图。',
        items: ['平台概览落地页', '模拟数据的数据集目录', '设计系统与组件库'],
      },
      {
        title: '数据集浏览',
        desc: '基于真实数据的完整数据集浏览与搜索功能。',
        items: ['真实数据集元数据 API', '全文搜索与筛选', '数据集详情页', '预览与可视化'],
      },
      {
        title: '上传与下载',
        desc: '支持社区在身份验证后上传和下载真机数据集。',
        items: ['用户身份验证系统', '数据集上传管线', '断点续传下载', '阿里云 OSS 集成'],
      },
      {
        title: '基准与社区',
        desc: '面向真机 RL 的社区功能与策略评估基准。',
        items: ['基准排行榜', '社区数据集贡献', '策略评估工具', 'API 访问令牌'],
      },
    ],
    teamBadge: '我们的团队',
    teamTitle: '来自上海交通大学 MINT 实验室',
    teamDesc: 'EvoData 由上海交通大学 MINT 实验室开发，该团队专注于机器人学习、操作智能与具身 AI 研究。',
    teamTags: ['研究驱动', '开源', '社区优先', '上交大 MINT 实验室'],
    statusLabels: { current: '进行中', upcoming: '即将推出', planned: '规划中', future: '未来计划' },
  },
};

// ─── Datasets Page ────────────────────────────────────────
export const datasetsT = {
  en: {
    badge: 'Dataset Catalog',
    title1: 'Explore ',
    titleHighlight: 'Datasets',
    desc: 'Browse our curated collection of real-robot reinforcement learning datasets. All datasets are standardized and ready for integration into your RL training pipeline.',
    searchPlaceholder: 'Search datasets, robots, formats...',
    found: 'datasets found',
    comingSoon: 'Download available in Phase 2',
    noResults: 'No datasets match your search',
    noResultsHint: 'Try a different keyword or remove the tag filter.',
    clearFilters: 'Clear filters',
    tags: ['All', 'RL', 'Manipulation', 'Navigation', 'Locomotion', 'Humanoid', 'Simulation', 'Real-World', 'Benchmark', 'Dexterous'],
    allLabel: 'All',
  },
  zh: {
    badge: '数据集目录',
    title1: '探索',
    titleHighlight: '数据集',
    desc: '浏览我们精心整理的真机强化学习数据集。所有数据集均已标准化，可直接集成到您的 RL 训练管线中。',
    searchPlaceholder: '搜索数据集、机器人、格式...',
    found: '个数据集',
    comingSoon: '下载功能将在第二阶段上线',
    noResults: '没有匹配的数据集',
    noResultsHint: '请尝试其他关键词或取消标签筛选。',
    clearFilters: '清除筛选',
    tags: ['全部', 'RL', 'Manipulation', 'Navigation', 'Locomotion', 'Humanoid', 'Simulation', 'Real-World', 'Benchmark', 'Dexterous'],
    allLabel: '全部',
  },
};

// ─── Dataset Card ─────────────────────────────────────────
export const datasetCardT = {
  en: {
    tasks: 'Tasks',
    trajectories: 'Trajectories',
    details: 'Details',
    download: 'Download',
  },
  zh: {
    tasks: '任务数',
    trajectories: '轨迹数',
    details: '详情',
    download: '下载',
  },
};

// ─── Dataset Detail ───────────────────────────────────────
export const detailT = {
  en: {
    back: 'Back to Datasets',
    about: 'About this Dataset',
    aboutSuffix: ' This dataset is designed for training and evaluating robot learning policies. It includes diverse scenarios and environmental conditions to improve policy generalization.',
    warningTitle: 'Download Coming in Phase 2',
    warningDesc: 'Dataset download functionality is planned for Phase 2 of the platform. For early access, please contact us via email.',
    downloadBtn: 'Download (Coming Soon)',
    infoTitle: 'Dataset Info',
    relatedTitle: 'Related Datasets',
    labels: { Size: 'Size', Tasks: 'Tasks', Robot: 'Robot', Format: 'Format', License: 'License', Trajectories: 'Trajectories' },
  },
  zh: {
    back: '返回数据集列表',
    about: '数据集简介',
    aboutSuffix: ' 该数据集专为机器人学习策略的训练与评估而设计，涵盖多样化的场景和环境条件，有助于提升策略的泛化能力。',
    warningTitle: '下载功能将在第二阶段上线',
    warningDesc: '数据集下载功能计划在平台第二阶段推出。如需提前访问，请通过邮件联系我们。',
    downloadBtn: '下载（即将推出）',
    infoTitle: '数据集信息',
    relatedTitle: '相关数据集',
    labels: { Size: '大小', Tasks: '任务数', Robot: '机器人', Format: '格式', License: '许可证', Trajectories: '轨迹数' },
  },
};

// ─── Guide Page ───────────────────────────────────────────
export const guideT = {
  en: {
    badge: 'Documentation',
    title: 'Guide & Documentation',
    desc: 'Comprehensive documentation and guides for the EvoData platform are currently in progress. They will be available alongside Phase 2 of the platform launch.',
    quickStartTitle: 'Quick Start',
    installLabel: 'Install',
    exampleLabel: 'Example Usage',
    featuresTitle: 'What You Can Do',
    features: [
      { title: 'Getting Started Guide', desc: 'Step-by-step tutorial to set up EvoData and access your first real-robot dataset.' },
      { title: 'API Reference', desc: 'Complete API documentation for programmatic dataset access and management.' },
      { title: 'CLI Tools', desc: 'Command-line interface for dataset download, upload, and management.' },
      { title: 'Framework Integrations', desc: 'Ready-to-use integrations for LeRobot, TensorFlow Datasets, and PyTorch.' },
    ],
    wipTitle: 'Full Documentation Coming Soon',
    wipDesc: 'The complete documentation is under active development and will be released alongside Platform Phase 2. Stay tuned!',
  },
  zh: {
    badge: '文档中心',
    title: '使用指南与文档',
    desc: 'EvoData 平台的完整文档与使用指南正在积极编写中，将随平台第二阶段一同发布。',
    quickStartTitle: '快速开始',
    installLabel: '安装',
    exampleLabel: '使用示例',
    featuresTitle: '你可以做什么',
    features: [
      { title: '快速上手指南', desc: '逐步教程，帮助您配置 EvoData 并访问第一个真机数据集。' },
      { title: 'API 参考文档', desc: '用于程序化访问和管理数据集的完整 API 文档。' },
      { title: '命令行工具', desc: '用于数据集下载、上传和管理的命令行接口。' },
      { title: '框架集成', desc: '适用于 LeRobot、TensorFlow Datasets 和 PyTorch 的即用型集成。' },
    ],
    wipTitle: '完整文档即将上线',
    wipDesc: '完整文档正在积极开发中，将随平台第二阶段一同发布，敬请期待！',
  },
};

// ─── Footer ───────────────────────────────────────────────
export const footerT = {
  en: {
    desc: 'An open data platform for real-robot reinforcement learning. Empowering the community with high-quality, standardized trajectory datasets.',
    groups: [
      {
        title: 'Platform',
        links: [
          { label: 'Home', href: '/' },
          { label: 'Datasets', href: '/datasets' },
          { label: 'About', href: '/about' },
          { label: 'Guide', href: '/guide' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'Documentation', href: '/guide' },
          { label: 'Data Format', href: '/guide' },
          { label: 'API Reference', href: '/guide' },
          { label: 'Changelog', href: '/about' },
        ],
      },
      {
        title: 'Community',
        links: [
          { label: 'GitHub', href: 'https://github.com/MINT-SJTU', external: true as const },
          { label: 'Contact Us', href: 'mailto:contact@evo-data.io', external: true as const },
          { label: 'MINT Lab', href: 'https://github.com/MINT-SJTU', external: true as const },
        ],
      },
    ],
    copyright: 'EvoData · MINT Lab, SJTU. All rights reserved.',
    builtWith: 'Built with',
    forRobotics: 'for Real-Robot RL',
  },
  zh: {
    desc: '面向真机强化学习的开放数据平台，为社区提供高质量、标准化的轨迹数据集。',
    groups: [
      {
        title: '平台',
        links: [
          { label: '首页', href: '/' },
          { label: '数据集', href: '/datasets' },
          { label: '关于', href: '/about' },
          { label: '使用指南', href: '/guide' },
        ],
      },
      {
        title: '资源',
        links: [
          { label: '文档', href: '/guide' },
          { label: '数据格式', href: '/guide' },
          { label: 'API 参考', href: '/guide' },
          { label: '更新日志', href: '/about' },
        ],
      },
      {
        title: '社区',
        links: [
          { label: 'GitHub', href: 'https://github.com/MINT-SJTU', external: true as const },
          { label: '联系我们', href: 'mailto:contact@evo-data.io', external: true as const },
          { label: 'MINT 实验室', href: 'https://github.com/MINT-SJTU', external: true as const },
        ],
      },
    ],
    copyright: 'EvoData · 上海交通大学 MINT 实验室。保留所有权利。',
    builtWith: '专为',
    forRobotics: '真机强化学习而构建',
  },
};
