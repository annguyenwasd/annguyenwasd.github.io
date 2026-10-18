---
layout: default
---

<div class="post-summary">
    <h2 data-i18n="home.title">Bài viết</h2>
    <p data-i18n="home.intro">Những thứ mình học được và làm, mới nhất lên đầu.</p>
    {% for post in site.posts %}
    <div class="post-item">
        <p class="post-date">{{ post.date | date: '%Y-%m-%d' }}</p>
        <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a><span class="lang-badge">{{ post.lang | default: site.lang | default: 'vi' | upcase }}</span></h3>
        {% if post.description %}<p class="post-desc">{{ post.description }}</p>{% endif %}
    </div>
    {% endfor %}
</div>
