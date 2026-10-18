---
layout: default
---

<div class="post-summary">
    <h2>Posts</h2>
    <p>Things I've learned and built, newest first.</p>
    {% for post in site.posts %}
    <div class="post-item">
        <p class="post-date">{{ post.date | date: '%Y-%m-%d' }}</p>
        <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        {% if post.description %}<p class="post-desc">{{ post.description }}</p>{% endif %}
    </div>
    {% endfor %}
</div>
