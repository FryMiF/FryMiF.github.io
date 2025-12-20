// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', function() {
    // 页面加载时添加过渡效果
    document.body.classList.add('page-transition');
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    // 移动端导航菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            
            // 防止菜单展开时背景滚动
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Ensure homepage Tetris preview blocks render (inject 4x4 cells if missing)
    (function initTetrisCardPreview() {
        const previews = document.querySelectorAll('.tetromino-preview');
        if (!previews || previews.length === 0) return;
        previews.forEach(el => {
            if (!el || el.children.length > 0) return;
            const frag = document.createDocumentFragment();
            for (let i = 0; i < 16; i++) frag.appendChild(document.createElement('div'));
            el.appendChild(frag);
        });
    })();
    
    // 打字机效果 - 欢迎区
    const typewriterElement = document.getElementById('typewriter-text');
    if (typewriterElement) {
        const fullText = "欢迎来到我们的迷你游戏合集。这里集合了由我们团队开发的各种有趣小游戏，带给您简单而愉快的游戏体验。";
        let currentIndex = 0;
        const typingSpeed = 50; // 提高打字速度 (ms)，移动设备上更快
        const pauseTime = 2000; // 完成后暂停时间 (ms)
        
        function typeEffect() {
            if (!typewriterElement) return;
            
            // 打字完成后暂停，然后重新开始
            if (currentIndex === fullText.length) {
                setTimeout(() => {
                    currentIndex = 0;
                    typewriterElement.textContent = '';
                    typeEffect();
                }, pauseTime);
                return;
            }
            
            // 更新显示文本
            currentIndex++;
            typewriterElement.textContent = fullText.substring(0, currentIndex);
            
            // 设置下一次执行
            setTimeout(typeEffect, typingSpeed);
        }
        
        // 无论设备类型，都启用打字效果
        typeEffect();
    }
    
    // 打字机效果 - 团队描述
    const teamTypewriterElement = document.getElementById('team-typewriter-text');
    if (teamTypewriterElement) {
        // 将文本分成四行
        const lines = [
            "我们是一支充满激情的团队，",
            "致力于创造好玩、有趣的游戏体验。",
            "每位成员都贡献自己的专业技能，",
            "打造了这个迷你游戏合集网站。"
        ];
        
        // 纯文本版本（用于逐字打印）
        const plainText = lines.join('\n');
        
        // 预先创建所有span标签，但内容为空，保持结构稳定
        let initialHtml = '';
        for (let i = 0; i < lines.length; i++) {
            initialHtml += `<span>${i > 0 ? '\n' : ''}</span>`;
        }
        teamTypewriterElement.innerHTML = initialHtml;
        
        let currentIndex = 0;
        const typingSpeed = 30; // 更快的打字速度
        const pauseTime = 3000; // 完成后暂停时间更长
        
        function typeTeamEffect() {
            if (!teamTypewriterElement) return;
            
            // 打字完成后暂停，然后重新开始
            if (currentIndex === plainText.length) {
                setTimeout(() => {
                    // 不清空HTML，而是使用淡出淡入效果
                    teamTypewriterElement.style.opacity = '0';
                    
                    setTimeout(() => {
                        currentIndex = 0;
                        // 重置为初始结构
                        teamTypewriterElement.innerHTML = initialHtml;
                        teamTypewriterElement.style.opacity = '1';
                        typeTeamEffect();
                    }, 500); // 淡出后再重置
                }, pauseTime);
                return;
            }
            
            // 更新显示文本
            currentIndex++;
            
            // 将当前部分文本转换为对应的HTML
            let currentPlainText = plainText.substring(0, currentIndex);
            let currentLines = currentPlainText.split('\n');
            
            // 更新HTML，保持结构稳定
            const spans = teamTypewriterElement.getElementsByTagName('span');
            for (let i = 0; i < lines.length; i++) {
                if (i < currentLines.length) {
                    spans[i].textContent = currentLines[i];
                } else {
                    spans[i].textContent = '';
                }
            }
            
            // 设置下一次执行
            setTimeout(typeTeamEffect, typingSpeed);
        }
        
        // 添加初始CSS过渡
        teamTypewriterElement.style.transition = 'opacity 0.5s ease';
        
        // 无论设备类型，都启用打字效果
        setTimeout(() => {
            typeTeamEffect();
        }, 1000); // 延迟1秒开始，让页面先加载
    }
    
    // 添加平滑滚动到锚点链接
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            // 检查目标元素是否存在
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            // 计算滚动位置（减去导航栏高度）
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // 如果在移动设备上，点击后关闭菜单
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // 页面滚动动画效果，使用防抖函数优化性能
    const fadeInElements = document.querySelectorAll('.fade-in');
    const slideInElements = document.querySelectorAll('.slide-in');
    
    // 防抖函数，优化滚动事件处理
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // 检测元素是否进入视口的函数
    const isInViewport = function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    };
    
    // 滚动处理函数
    const handleScroll = function() {
        // 处理淡入元素
        fadeInElements.forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('visible');
            }
        });
        
        // 处理滑入元素
        slideInElements.forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('visible');
            }
        });
    };
    
    // 优化的滚动事件处理
    const debouncedHandleScroll = debounce(handleScroll, 10);
    
    // 初始检查并绑定滚动事件
    handleScroll();
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    
    // 确保关键静态内容始终可见，不受滚动影响
    document.querySelectorAll('.section-title, .hero-content').forEach(element => {
        element.classList.add('visible');
    });
    
    // 团队展示区的响应式调整
    function adjustTeamLayout() {
        const teamContainer = document.querySelector('.team-circle-container');
        if (!teamContainer) return;
        
        const teamMembers = teamContainer.querySelectorAll('.team-member');
        const teamLogo = teamContainer.querySelector('.team-logo');
        const teamRing = teamContainer.querySelector('.team-ring');
        
        // 无论是否移动设备，都保持圆形布局
        // 手动设置成员位置以确保正确显示
        if (teamMembers.length >= 3) {
            // 第一个成员 - 左侧
            teamMembers[0].style.top = '50%';
            teamMembers[0].style.left = '0';
            teamMembers[0].style.right = 'auto';
            teamMembers[0].style.transform = 'translateY(-50%)';
            
            // 第二个成员 - 上部
            teamMembers[1].style.top = '0%';
            teamMembers[1].style.left = '50%';
            teamMembers[1].style.right = 'auto';
            teamMembers[1].style.transform = 'translateX(-50%)';
            
            // 第三个成员 - 右侧
            teamMembers[2].style.top = '50%';
            teamMembers[2].style.left = 'auto';
            teamMembers[2].style.right = '0';
            teamMembers[2].style.transform = 'translateY(-50%)';
        }
        
        if (teamLogo) {
            teamLogo.style.position = 'absolute';
            teamLogo.style.transform = 'translate(-50%, -50%)';
        }
        
        if (teamRing) {
            teamRing.style.display = 'block';
        }
    }
    
    // 添加触摸支持：让hover效果在移动设备上也能正常工作
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        const cards = document.querySelectorAll('.game-card, .team-member');
        cards.forEach(card => {
            card.addEventListener('touchstart', function() {
                this.classList.add('touch-hover');
            }, { passive: true });
            
            card.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-hover');
                }, 300);
            }, { passive: true });
        });
    }
    
    // 使用ResizeObserver代替window.resize事件，提高性能
    if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(debounce(() => {
            adjustTeamLayout();
        }, 100));
        
        const observeTarget = document.querySelector('.team-showcase');
        if (observeTarget) {
            resizeObserver.observe(observeTarget);
        }
    } else {
        // 回退到传统的resize事件，如果浏览器不支持ResizeObserver
        window.addEventListener('resize', debounce(adjustTeamLayout, 100));
    }
    
    // 初始调整
    adjustTeamLayout();
}); 
