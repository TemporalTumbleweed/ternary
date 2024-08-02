# About
Wikipedia defines the Ternary Plot as follows:

> A ternary plot, ternary graph, triangle plot, simplex plot, or Gibbs triangle is a barycentric plot on three variables which sum to a constant. It graphically depicts the ratios of the three variables as positions in an equilateral triangle. It is used in physical chemistry, petrology, mineralogy, metallurgy, and other physical sciences to show the compositions of systems composed of three species. Ternary plots are tools for analyzing compositional data in the three-dimensional case.

Browsing through other visualizations, I found remarkable diversity in the types of data folks visualized using these plots. 
One particularly striking example was [Adam McCann visualization](https://www.flerlagetwins.com/2019/08/ternary.html) based on text from the Game of Thrones series. 
Given the upcoming U.S. elections, I thought it would be fun to compare the speech used by the leading Democrat, Republican, and Independent nominees.

Text was taken from the following sources:
- https://www.rev.com/blog/transcript-tag/donald-trump
- https://www.rev.com/blog/transcript-tag/kamala-harris
- https://www.rev.com/blog/transcript-tag/rfk-jr

I computed the top 100 words (excluding stop words) for each candidate by frequency and merged them all together. 
I normalized the frequency by the amount of text available. 
I interpret the resulting number as a measure of how important that word is to the candidate's speech. 
Comparing the importance of words across the 3 candidates yields the Ternary Plot above. 
The bubbles are scaled based on the average importance of the word. 
All analysis was done in Python using standard tools (i.e., Pandas, sklearn) and the site was created using D3.

# Attributions
If you find this project helpful and want to remix it for your own data, feel free to do so! 
I only ask for an attribution at u/TemporalTumbleweed either as a footer or in a README.md file.
