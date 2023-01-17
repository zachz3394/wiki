import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import parse from 'html-react-parser';

interface ArticleProps {
  legends?: boolean;
}

const Article = (props: ArticleProps) => {
  const { legends } = props;
  const { articleId } = useParams();
  const pageId = legends ? articleId + '/Legends' : articleId;

  const [ text, setText ] = useState('');

  const tailRegexSpace = new RegExp('\/revision[^\\s\"]+[\\s]', 'g'); 
  const tailRegexQuote = new RegExp('\/revision[^\\s\"]+[\"]', 'g'); 
  
  // Parsed HTML only contains image source in data-src tags, so this is necessary
  const setupLazyLoad = () => {
    let lazyImages = [].slice.call(document.querySelectorAll('.lazyload'));

    if ('IntersectionObserver' in window) {
      let lazyImageObserver = new IntersectionObserver((entries: IntersectionObserverEntry[], _: IntersectionObserver) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
          if (entry.isIntersecting) {
            let lazyImage = entry.target as any;
            lazyImage.src = lazyImage.dataset.src;
            lazyImage.classList.remove('lazyload');
            lazyImageObserver.unobserve(lazyImage);
          }
        });
      });

      lazyImages.forEach(function(lazyImage) {
        lazyImageObserver.observe(lazyImage);
      });
    } else {
      console.log('Lazy loading not supported');
    }
  }

  const setupHideableContent = () => {
    const hideableContainers = document.querySelectorAll<HTMLElement>('.hidable');
    hideableContainers.forEach((hideable: HTMLElement) => {
      const startHidden = hideable.classList.contains('start-hidden');

      const hideableButton = hideable.querySelector<HTMLElement>('.hidable-button')!;
      const hideableContent = hideable.querySelector<HTMLElement>('.hidable-content')!;

      const hideContent = () => {
        hideableContent.style.display = 'none';
        hideableButton.innerHTML = '[Show]';
        hideableButton.onclick = showContent;
      }

      const showContent = () => {
        hideableContent.style.removeProperty('display');
        hideableButton.innerHTML = '[Hide]';
        hideableButton.onclick = hideContent;
      }

      if (startHidden) hideContent();
      else showContent();
    });
  }

  useEffect(() => {
    fetch(`https://starwars.fandom.com/api.php?action=parse&origin=*&format=json&page=${pageId}`)
    .then((x: any) => x.json())
    .then((x: any) => {
      let t = x.parse.text['*'] 
      t = t.replaceAll(tailRegexSpace, ' ')
      t = t.replaceAll(tailRegexQuote, '"')
      setText(t);
    });
  }, []);

  useEffect(() => {
    setupLazyLoad();
    setupHideableContent();
  }, [ text ])

  return (
    <div className='article-wrapper'>
      {parse(text)}
    </div>
  );
};

export default Article;