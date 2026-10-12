"use client";

import Image from "next/image";
import ImageBox from "./ImageBox";

export default function Article() {
  return (
    <div className="min h-screen w-full ">
      {/* HERO */}
      <div className="absolute top-0 left-0 z-20 bg-background flex flex-col items-start justify-center px-12 pt-12 pb-6 gap-6 h-screen w-full  ">
        <h1 className="text-4xl font-baskerVilleOld uppercase tracking-[.25em] leading-relaxed">
          Bokmässan del IV: Litteraturen är forever
        </h1>
        <div className="relative w-1/2 h-64">
          <Image
            src="/552480399_1135570284737492_1550349593426496482_n-1-451x600.jpg.webp"
            alt="Article image"
            fill
            className="object-contain object-left"
          />
        </div>
        <span>
          <h2 className="text-2xl font-baskerVilleOld  tracking-widest leading-relaxed">
            Charlie Brandin Avehall
          </h2>
          <h3 className="text-xl font-baskervilleClassic italic  tracking-wider leading-relaxed">
            september, 28, 2025
          </h3>
        </span>
      </div>
      <div className=" flex flex-col pt-[100vh] px-4 pb-12 p  ">
        <p className="whitespace-pre-line">
          {"Det är söndag och jag mår mycket illa på tåget tillbaka Stockholm men nödgas blogga eftersom min hårde men rättvise redaktör Jonathan har satt krypskyttar väntandes utanför mitt hus, redo att avfyra, om jag inte gör ett sista blogginlägg. Jag lovar att inte nämna Doom så mycket här men ni bör veta att jag lyssnar på Dopesmoker medan jag skriver dessa ord"}
        </p>

        <ImageBox
          src="/553788533_1331823558527125_7275042213390294688_n.jpg.webp"
          alt="Article image"
          caption="Bildtext"
        />
        <p className="whitespace-pre-line">
          {`Vi följer, som man säger, the smoke toward the riff-filled land av lördag. Jag och Ali är på bokmässans golv. Kanske är det eftermiddag. Jag minns inte hur vi hamnade där. Vi besöker äntligen Tranans monter. Tyvärr är jag lite besviken på utbudet, det enda de har av Clarice Lispector är Stjärnans ögonblick. Men Ali för min uppmärksamhet till deras barnavdelning, som heter Bokförlaget Trasten. De har världens gulligaste logga. Älskar att förlaget som givit ut Thomas Bernhards Utplåning också säljer barnböcker\nVi går till bokmässans bar och sätter oss vid ett bord med en ensam kille, som vi efter några minuter råkar mobba bort. Bredvid vårt bord säger någon sorts kristen man till en grupp människor att Jesus kastade ut månglarna ur templet, det vet ni. Ali läser på rum för poesi, han har kanske inte samma doomröst som den rysklettiske poeten igår men uppväger detta med en jättebra dikt. Malte Persson är också jättebra, han läser om att Klaus är granne med Gud.\nUtanför mässan möter vi upp Tora och Runa och gårdagens kvartett är återuppstånden. Ali nobbar Nordstedtsmiddagen för vänskapens skull. Mina tysta böner besvaras när vi går till Andra lång. Eftersom enbart jag är från Göteborg kan jag tvinga alla att gå till de barer jag vill. Vi går till Soho som jag alltid tyckt har en älskvärd toa men när jag går in dit är den inte riktigt lika älskvärd som jag minns. Men de spelar Pavements Gold Soundz i baren. En Ford Galaxie 500 kör förbi på gatan. Det är indie city over here.`}
        </p>
        <ImageBox
          src="/553727805_3396921827115065_8915998007663317781_n-1.jpg.webp"
          alt="Article image"
          caption="Bildtext"
        />
        <p className="whitespace-pre-line">
          {"På den i och för sig danmarkinspirerade men ändå fina baren Dansken beställer jag hakkebøf och det är otroligt gott. Framförallt är jag kanske hungrig och hakkebøfen mat. Jag och Ali försöker lära tjejerna att göra Bloods-tecknet. Vi lämnar Andra lång för karaokebaren Sing Sing och där tar vår berättelse en mörkare vändning, inte för att något händer, det är bara mörkt att vi lämnar Andra lång. Utanför Sing Sing visar jag vakten min väska och hon säger kom lite närmare, jag bits inte. Hon håller sitt ord och jag kommer in oskadd. På karaoken sjunger någon Eloise, en väldigt dålig låt. Jag skulle kunna säga vad jag tycker de borde spela istället men jag avstår denna gång."}
        </p>
        <ImageBox
          src="/553657511_826173009934856_7687135688975492456_n-1.jpg.webp"
          alt="Article image"
          caption="Bildtext"
        />
        <p className="whitespace-pre-line">
          {"Kvällen slutar på en bar jag inte vet namnet på mittemot hotell Avalon. En bit av poolen på Avalons tak hänger ut över gatan, och jag har länge tänkt att en sorts projektil avfyrad mot poolens glasgolv skulle kunna få en simmare att forsa ut tillsammans med vattnet ner till sin död, mitt bland pöbeln på gatan därnere. Tora beställer sexor tequila till oss av någon anledning. Jonathan svänger förbi, påstår att hans byxor har gått sönder, och går hem kort därefter. De andra tycker att jag plötsligt har blivit depressiv."}
        </p>
      </div>
    </div>
  );
}
