import React from 'react';

class Flapjack extends React.Component {
  render() {
    return (
      <div className="flapjack">
        <header><h1>What a tasty flapjack! React {React.version}</h1></header>
        <main>
          <h2>I know, right!?</h2>
          <p>
            Bacon ipsum dolor amet picanha hamburger shankle boudin drumstick. Turkey fatback
            prosciutto cupim frankfurter beef pork alcatra. Pork chop tongue jowl porchetta spare
            ribs chuck ground round frankfurter kevin short loin pork belly. Frankfurter bresaola
            pastrami pig tri-tip. Strip steak frankfurter ball tip short ribs. Drumstick cupim
            frankfurter, jerky ribeye pig pork chop landjaeger beef prosciutto sausage andouille
            shoulder boudin venison. Tenderloin shank capicola pork belly, meatloaf kielbasa
            pancetta pork chop brisket meatball cupim.
          </p>
          <p>
            Flank chuck t-bone, ham hock kielbasa short ribs pancetta chicken strip steak. Short
            ribs spare ribs landjaeger alcatra andouille tongue meatball turkey strip steak. Pig
            porchetta ham meatball kevin. T-bone boudin leberkas corned beef pork belly pork loin.
          </p>
          <p>
            Leberkas meatball tail beef flank t-bone. Pork pancetta tenderloin turducken,
            beef picanha venison pork loin kevin cow tri-tip pig. Leberkas ball tip drumstick short
            loin pastrami pancetta doner landjaeger, jerky pork chop chuck picanha sausage jowl
            rump. Shoulder boudin tongue, salami bacon pig landjaeger beef ribs kevin biltong
            tenderloin chuck turducken. Kevin shank flank beef chuck doner biltong spare ribs.
          </p>
          <p>
            Leberkas pig tail spare ribs, shank short ribs chicken biltong venison. Kielbasa cupim
            andouille, tri-tip tail spare ribs ham pork belly alcatra venison corned beef shoulder
            short ribs jowl turkey. Beef ribs fatback alcatra, turducken biltong ground round
            sausage hamburger meatloaf rump ball tip jerky shoulder. Tongue landjaeger andouille
            pig picanha meatball cow corned beef, tenderloin shank ball tip. Jowl turkey spare
            ribs beef, frankfurter venison tenderloin t-bone swine cow sausage meatball
            pancetta pig. Jowl turducken flank swine.
          </p>
          <p>
            Jerky kevin boudin bacon. Shoulder strip steak pork chop ground round andouille
             t-bone hamburger doner ball tip ribeye. Meatball turducken boudin beef ribs landjaeger,
             tongue pork chop alcatra prosciutto frankfurter flank pig bresaola chicken cow. Rump
             flank leberkas bresaola swine venison hamburger t-bone kielbasa shankle. Picanha flank
             cupim, swine capicola ground round kevin turducken tongue pork sausage. Brisket chuck
             filet mignon tongue, tri-tip tail hamburger ground round meatball corned beef short
             loin bresaola.
          </p>
        </main>
      </div>
    );
  }
}

React.render(<Flapjack />, document.body);
