// Утилиты для генерации Schema.org микроразметки

export interface CarSchema {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  engine: string;
  transmission: string;
  images: string[];
  company: {
    name: string;
    city: string;
  };
}

export interface CompanySchema {
  id: number;
  name: string;
  logo: string;
  rating: number;
  phone: string;
  city: string;
  reviews: Array<{
    author: string;
    text: string;
    date: string;
  }>;
}

export interface NewsSchema {
  id: number;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  image?: string;
}

// Генерация микроразметки для автомобиля
export const generateCarSchema = (car: CarSchema) => ({
  "@context": "https://schema.org",
  "@type": "Car",
  "name": `${car.brand} ${car.model}`,
  "brand": {
    "@type": "Brand",
    "name": car.brand
  },
  "model": car.model,
  "vehicleModelDate": car.year.toString(),
  "mileageFromOdometer": {
    "@type": "QuantitativeValue",
    "value": car.mileage,
    "unitCode": "KMT"
  },
  "offers": {
    "@type": "Offer",
    "price": car.price,
    "priceCurrency": "RUB",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": car.company.name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": car.company.city
      }
    }
  },
  "image": car.images[0],
  "description": `${car.brand} ${car.model} ${car.year} года, ${car.engine}, ${car.transmission}`,
  "url": `${window.location.origin}/cars/${car.id}`
});

// Генерация микроразметки для компании
export const generateCompanySchema = (company: CompanySchema) => ({
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "name": company.name,
  "image": company.logo,
  "telephone": company.phone,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": company.city
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": company.rating,
    "reviewCount": company.reviews.length,
    "bestRating": 5,
    "worstRating": 1
  },
  "review": company.reviews.slice(0, 3).map(review => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "reviewBody": review.text,
    "datePublished": review.date
  })),
  "url": `${window.location.origin}/companies/${company.id}`,
  "description": `Автосалон ${company.name} в городе ${company.city}. Рейтинг: ${company.rating.toFixed(1)}/5`
});

// Генерация микроразметки для новости
export const generateNewsSchema = (news: NewsSchema) => ({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": news.title,
  "author": {
    "@type": "Person",
    "name": news.author
  },
  "datePublished": news.publishedAt,
  "image": news.image,
  "articleBody": news.content,
  "url": `${window.location.origin}/news/${news.id}`,
  "publisher": {
    "@type": "Organization",
    "name": "VELES AUTO",
    "logo": {
      "@type": "ImageObject",
      "url": `${window.location.origin}/logo.png`
    }
  }
});

// Генерация микроразметки для веб-сайта
export const generateWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "VELES AUTO",
  "description": "Лучший агрегатор автомобилей и компаний. Тысячи предложений от проверенных дилеров.",
  "url": window.location.origin,
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${window.location.origin}/cars?search={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "VELES AUTO",
    "url": window.location.origin,
    "logo": {
      "@type": "ImageObject",
      "url": `${window.location.origin}/logo.png`
    }
  }
});

// Генерация микроразметки для организации
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "VELES AUTO",
  "description": "Агрегатор автомобилей и автосервисов",
  "url": window.location.origin,
  "logo": {
    "@type": "ImageObject",
    "url": `${window.location.origin}/logo.png`
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "Russian"
  },
  "sameAs": [
    "https://t.me/veles_auto_bot"
  ]
});

// Генерация микроразметки для хлебных крошек
export const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url
  }))
});

// Генерация микроразметки для FAQ
export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
}); 