import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

interface IPCSection {
  id: string;
  section: string;
  title: string;
  description: string;
}

const ipcData: IPCSection[] = [
  { id: "1", section: "Section 1", title: "Title and extent", description: "This Act is called the Indian Penal Code and applies across India." },
  { id: "2", section: "Section 2", title: "Punishment for offences committed within India", description: "Any offence committed within India is punishable under this Code." },
  { id: "3", section: "Section 3", title: "Punishment for offences beyond India", description: "Offences committed outside India may be tried here if law allows." },
  { id: "4", section: "Section 4", title: "Extension of Code to extra-territorial offences", description: "Certain offences committed outside India by Indian citizens are punishable here." },
  { id: "5", section: "Section 5", title: "Certain laws not to be affected", description: "This Code does not affect any other special laws unless explicitly mentioned." },
  { id: "6", section: "Section 6", title: "Definitions", description: "Defines key terms like 'India', 'Court', 'Public Servant', etc." },
  { id: "7", section: "Section 7", title: "Abetment", description: "Defines when someone instigates, aids, or conspires in a crime." },
  { id: "8", section: "Section 8", title: "Punishment for abetment", description: "Abettors are punished as if they committed the offence themselves." },
  { id: "9", section: "Section 9", title: "Criminal liability of partners", description: "Partners of a firm may be liable if they conspire or aid in offences." },
  { id: "10", section: "Section 10", title: "Responsibility of persons for acts of others", description: "Certain persons may be responsible for acts done by others in special circumstances." },
  { id: "11", section: "Section 11", title: "Exemptions", description: "Some acts are exempt from punishment under this Code." },
  { id: "12", section: "Section 12", title: "Punishment of offence committed by mistake of fact", description: "Acts done by mistake of fact may not be punishable." },
  { id: "13", section: "Section 13", title: "Punishment of acts done without criminal intention", description: "Acts without mens rea (criminal intent) are not punishable." },
  { id: "14", section: "Section 14", title: "Punishment of acts done in good faith for benefit of others", description: "Acts done in good faith to benefit someone are not offences." },
  { id: "15", section: "Section 15", title: "Liability of King’s soldiers", description: "Offences committed by government soldiers under lawful duty may be exempt." },
  { id: "16", section: "Section 16", title: "Intent and knowledge", description: "Explains mens rea: criminal intention and knowledge of consequences." },
  { id: "17", section: "Section 17", title: "Definition of 'public servant'", description: "Defines who is a public servant under the Code." },
  { id: "18", section: "Section 18", title: "Definition of 'judicial officer'", description: "Defines judicial officers who can enforce this Code." },
  { id: "19", section: "Section 19", title: "Definition of 'offence'", description: "Explains what constitutes an offence under the Code." },
  { id: "20", section: "Section 20", title: "Definition of 'wrongful gain'", description: "Wrongful gain means gain by illegal or dishonest means." },
  { id: "21", section: "Section 21", title: "Definition of 'dishonestly'", description: "Dishonesty means doing something with intent to cause wrongful gain/loss." },
  { id: "22", section: "Section 22", title: "Definition of 'criminal force'", description: "Force applied intentionally without consent is criminal force." },
  { id: "23", section: "Section 23", title: "Definition of 'voluntarily'", description: "Voluntarily means the act is done by free will without coercion." },
  { id: "24", section: "Section 24", title: "Definition of 'wrongful loss'", description: "Wrongful loss refers to loss caused to a person illegally or dishonestly." },
  { id: "25", section: "Section 25", title: "Definition of 'death'", description: "Death means the permanent cessation of life in a person." },
  { id: "26", section: "Section 26", title: "Definition of 'movable property'", description: "Movable property includes things that can be carried, transferred or moved." },
  { id: "27", section: "Section 27", title: "Definition of 'immovable property'", description: "Immovable property includes land, buildings, and rights attached to land." },
  { id: "28", section: "Section 28", title: "Definition of 'instrument'", description: "Instrument includes anything used to commit a crime." },
  { id: "29", section: "Section 29", title: "Definition of 'house'", description: "House includes any building, structure or place used for habitation." },
  { id: "30", section: "Section 30", title: "Definition of 'public place'", description: "A place to which the public has access, whether freely or on payment." },
  { id: "31", section: "Section 31", title: "Definition of 'dishonest misappropriation'", description: "Dishonest misappropriation is taking property unlawfully with intent to use it." },
  { id: "32", section: "Section 32", title: "Definition of 'fraud'", description: "Fraud is deceiving someone dishonestly for personal gain." },
  { id: "33", section: "Section 33", title: "Definition of 'cheating'", description: "Cheating is deceiving someone to deliver property or act against their interest." },
  { id: "34", section: "Section 34", title: "Common intention", description: "When multiple people commit a crime together, each is liable as if they acted alone." },
  { id: "35", section: "Section 35", title: "Common object", description: "In unlawful assemblies, all members share liability for acts done in furtherance of the common object." },
  { id: "36", section: "Section 36", title: "Liability of person for criminal act of another", description: "Certain persons are liable for acts committed by another under special circumstances." },
  { id: "37", section: "Section 37", title: "Liability of superior officer", description: "Superiors are liable if they order or tolerate offences." },
  { id: "38", section: "Section 38", title: "Definition of 'preparation'", description: "Preparation refers to acts intended to set up a criminal act." },
  { id: "39", section: "Section 39", title: "Definition of 'attempt'", description: "Attempt means doing something intending to commit a crime but failing." },
  { id: "40", section: "Section 40", title: "Liability for attempt", description: "A person attempting a crime is liable as if the offence were committed." },
  { id: "41", section: "Section 41", title: "Definition of 'assault'", description: "Assault means causing fear of immediate injury to someone." },
  { id: "42", section: "Section 42", title: "Definition of 'criminal trespass'", description: "Entering property unlawfully with intent to commit an offence." },
  { id: "43", section: "Section 43", title: "Definition of 'house-trespass'", description: "Unlawful entry into a dwelling place with criminal intent." },
  { id: "44", section: "Section 44", title: "Definition of 'lurking house-trespass'", description: "Entering a house secretly to commit an offence." },
  { id: "45", section: "Section 45", title: "Definition of 'criminal force on women'", description: "Applying force to a woman intending to outrage her modesty." },
  { id: "46", section: "Section 46", title: "Definition of 'rioting'", description: "Use of criminal force by an unlawful assembly." },
  { id: "47", section: "Section 47", title: "Definition of 'genuine threat'", description: "Causing fear of death or grievous hurt to enforce crime." },
  { id: "48", section: "Section 48", title: "Definition of 'culpable homicide'", description: "Causing death by act with intention or knowledge likely to cause death." },
  { id: "49", section: "Section 49", title: "Definition of 'murder'", description: "Culpable homicide is murder if done with intention to cause death or bodily injury likely to cause death." },
  { id: "50", section: "Section 50", title: "Definition of 'punishment'", description: "Specifies types of punishment such as imprisonment, fine, or death." },
  { id: "51", section: "Section 51", title: "Offences causing death", description: "Acts causing death under certain circumstances may be punished with life imprisonment or death." },
  { id: "52", section: "Section 52", title: "Definition of 'sentence'", description: "Sentence refers to the punishment awarded by a court for an offence." },
  { id: "53", section: "Section 53", title: "Punishments under the Code", description: "Specifies types of punishment: death, imprisonment for life, rigorous/simple imprisonment, forfeiture of property, or fine." },
  { id: "54", section: "Section 54", title: "Rigorous imprisonment", description: "Imprisonment with hard labor for a specified period." },
  { id: "55", section: "Section 55", title: "Simple imprisonment", description: "Imprisonment without hard labor for a specified period." },
  { id: "56", section: "Section 56", title: "Imprisonment for nonpayment of fine", description: "Failure to pay a fine may result in imprisonment for a term fixed by the court." },
  { id: "57", section: "Section 57", title: "Restriction of rigorous imprisonment", description: "Rigorous imprisonment cannot be awarded for offences punishable with simple imprisonment only." },
  { id: "58", section: "Section 58", title: "Death sentence", description: "Death may be awarded only for the gravest offences as specified by law." },
  { id: "59", section: "Section 59", title: "Commutation of sentence", description: "Courts or the government may commute sentences in certain cases." },
  { id: "60", section: "Section 60", title: "Limitation on death sentence", description: "Death sentence cannot be imposed for minors or under special conditions." },
  { id: "61", section: "Section 61", title: "Public servant exemption", description: "Public servants acting in good faith are not liable for official acts." },
  { id: "62", section: "Section 62", title: "Acts done by consent", description: "Acts done with consent are not offences unless contrary to law." },
  { id: "63", section: "Section 63", title: "Act done in good faith for benefit of others", description: "Acts done with honest intention to benefit someone are not punishable." },
  { id: "64", section: "Section 64", title: "Mistake of fact", description: "Acts done by mistake of fact without intent to commit offence are exempt from punishment." },
  { id: "65", section: "Section 65", title: "Miscarriage of justice", description: "Causing miscarriage by negligent act is punishable if it leads to harm." },
  { id: "66", section: "Section 66", title: "Acts not intended to cause death", description: "Acts not intended to cause death may still be punished if harm occurs." },
  { id: "67", section: "Section 67", title: "Acts causing harm", description: "Any act causing hurt or injury to others intentionally is punishable." },
  { id: "68", section: "Section 68", title: "Acts causing harm by negligence", description: "Harm caused by rash or negligent acts is punishable under the Code." },
  { id: "69", section: "Section 69", title: "Punishment for acts endangering life", description: "Acts endangering life of others are liable for punishment." },
  { id: "70", section: "Section 70", title: "Acts endangering property", description: "Damaging or endangering property unlawfully is punishable." },
  { id: "71", section: "Section 71", title: "Acts against public tranquility", description: "Acts disturbing public peace may be punished." },
  { id: "72", section: "Section 72", title: "Concealing offence", description: "Knowing an offence was committed and concealing it is punishable." },
  { id: "73", section: "Section 73", title: "Attempt to commit offence", description: "Attempting a crime is punishable as if the crime were committed." },
  { id: "74", section: "Section 74", title: "Abetment of offence", description: "Instigating or assisting a crime is punishable even if the crime is not completed." },
  { id: "75", section: "Section 75", title: "Abetment of impossible offence", description: "Abetting an impossible act with criminal intention is punishable." },
  { id: "76", section: "Section 76", title: "Right of private defence", description: "A person may defend themselves within reasonable limits without liability." },
  { id: "77", section: "Section 77", title: "Private defence against bodily harm", description: "Reasonable force can be used to prevent harm to oneself or others." },
  { id: "78", section: "Section 78", title: "Exceeding limits of private defence", description: "Excessive force beyond necessary defence is punishable." },
  { id: "79", section: "Section 79", title: "Act done by a person incapable of crime", description: "Children or mentally ill persons may not be liable if incapable of criminal intention." },
  { id: "80", section: "Section 80", title: "Accident in doing a lawful act", description: "Accidental harm during lawful acts is exempt from punishment." },
  { id: "81", section: "Section 81", title: "Act likely to cause harm", description: "Doing acts likely to cause harm without criminal intention is not punishable." },
  { id: "82", section: "Section 82", title: "Infancy", description: "Children under 7 years are exempt from criminal liability." },
  { id: "83", section: "Section 83", title: "Children aged 7–12", description: "Children aged 7–12 may be liable only if they have sufficient understanding of right and wrong." },
  { id: "84", section: "Section 84", title: "Unsoundness of mind", description: "Persons of unsound mind are not liable if incapable of understanding the act." },
  { id: "85", section: "Section 85", title: "Act of person of unsound mind", description: "Acts done by persons of unsound mind under compulsion are exempt." },
  { id: "86", section: "Section 86", title: "Acts done under intoxication", description: "Acts done under intoxication without criminal intent are generally exempt." },
  { id: "87", section: "Section 87", title: "Acts done under compulsion", description: "Acts done under coercion without criminal intent are exempt from punishment." },
  { id: "88", section: "Section 88", title: "Act not intended to cause death or hurt", description: "Acts done in good faith without intent to cause harm are not punishable." },
  { id: "89", section: "Section 89", title: "Accident", description: "Harm caused by accident without negligence or intention is exempt." },
  { id: "90", section: "Section 90", title: "Consent", description: "Acts done with consent are generally not punishable." },
  { id: "91", section: "Section 91", title: "Acts done in good faith", description: "Acts done honestly and without criminal intent are exempt." },
  { id: "92", section: "Section 92", title: "Acts done for benefit of minors", description: "Acts done to benefit children without harm are not punishable." },
  { id: "93", section: "Section 93", title: "Acts done under mistaken belief", description: "Acts done under mistaken belief in law are exempt if done in good faith." },
  { id: "94", section: "Section 94", title: "Acts done to prevent crime", description: "Acts done to prevent serious crime are generally justified." },
  { id: "95", section: "Section 95", title: "Private defence of property", description: "Force may be used to protect property within reasonable limits." },
  { id: "96", section: "Section 96", title: "Right of private defence", description: "Every person has the right to defend their body and property." },
  { id: "97", section: "Section 97", title: "Right of private defence of body", description: "Includes protection against danger to oneself or others." },
  { id: "98", section: "Section 98", title: "Right of private defence against deadly assault", description: "Deadly force may be used in defence against imminent death or grievous hurt." },
  { id: "99", section: "Section 99", title: "When the right of private defence of the body exists", description: "Defines circumstances when private defence can be used." },
  { id: "100", section: "Section 100", title: "When the right of private defence of the body extends to causing death", description: "Force causing death is justified in self-defence against deadly assault." },
  { id: "101", section: "Section 101", title: "Commencement of private defence of property", description: "Force may be used to protect property when there is imminent threat." },
  { id: "102", section: "Section 102", title: "When private defence of property extends to causing death", description: "Death can be caused in defence of property if there is risk of death or grievous hurt." },
  { id: "103", section: "Section 103", title: "Rights of public servants", description: "Public servants are justified in using force while performing lawful duties." },
  { id: "104", section: "Section 104", title: "Acts done in good faith for benefit of others", description: "Acts intended to benefit others without causing harm are exempt from punishment." },
  { id: "105", section: "Section 105", title: "Act done by consent", description: "Acts done with consent are generally not offences." },
  { id: "106", section: "Section 106", title: "Abetment by conspiracy", description: "Conspiring to commit an offence is punishable even if offence is not completed." },
  { id: "107", section: "Section 107", title: "Abetment of offence by instigation", description: "Instigating someone to commit a crime is punishable." },
  { id: "108", section: "Section 108", title: "Abetment of offence by aiding", description: "Helping someone commit a crime is punishable." },
  { id: "109", section: "Section 109", title: "Punishment for abetment of offence", description: "Abettors are liable for the same punishment as the principal offender." },
  { id: "110", section: "Section 110", title: "Liability for abetment of impossible act", description: "Abetment of an impossible crime is still punishable if intent exists." },
  { id: "111", section: "Section 111", title: "Liability for abetment of offence by act", description: "Person who aids by act is liable even if crime is not completed." },
  { id: "112", section: "Section 112", title: "Liability for abetment by omission", description: "Abetment by failure to act when legally bound is punishable." },
  { id: "113", section: "Section 113", title: "Culpable homicide", description: "Causing death intentionally or knowingly is culpable homicide." },
  { id: "114", section: "Section 114", title: "Presumption of culpable homicide in certain cases", description: "Law may presume culpable homicide in specific circumstances." },
  { id: "115", section: "Section 115", title: "Murder", description: "Culpable homicide is murder if committed with intention to cause death or grievous bodily injury." },
  { id: "116", section: "Section 116", title: "Punishment for murder", description: "Murder is punishable with death or life imprisonment and fine." },
  { id: "117", section: "Section 117", title: "Culpable homicide not amounting to murder", description: "Culpable homicide is lesser than murder if mitigating circumstances exist." },
  { id: "118", section: "Section 118", title: "Attempt to commit murder", description: "Attempting to commit murder is punishable with imprisonment up to ten years." },
  { id: "119", section: "Section 119", title: "Causing death by negligence", description: "Death caused by rash or negligent acts is punishable with imprisonment or fine." },
  { id: "120", section: "Section 120", title: "Criminal conspiracy", description: "Two or more people agreeing to commit a crime are liable for punishment." },
  { id: "120A", section: "Section 120A", title: "Definition of criminal conspiracy", description: "Agreement between two or more persons to commit an offence constitutes criminal conspiracy." },
  { id: "120B", section: "Section 120B", title: "Punishment of criminal conspiracy", description: "Parties to a criminal conspiracy are punishable as if they committed the crime themselves." },
  { id: "121", section: "Section 121", title: "Waging war against the government of India", description: "Waging war or attempting to wage war is punishable with death or life imprisonment." },
  { id: "121A", section: "Section 121A", title: "Conspiracy to wage war against India", description: "Conspiring to wage war against India is punishable with imprisonment up to life." },
  { id: "122", section: "Section 122", title: "Collecting arms to wage war", description: "Collecting arms or resources to wage war against India is punishable." },
  { id: "123", section: "Section 123", title: "Concealing designs against the government", description: "Concealing intentions to commit offences against the state is punishable." },
  { id: "124", section: "Section 124", title: "Sedition", description: "Acts or speech inciting hatred or contempt against the government are punishable with imprisonment up to life." },
  { id: "124A", section: "Section 124A", title: "Sedition", description: "Exciting disaffection towards the government is punishable with life imprisonment or up to three years and fine." },
  { id: "125", section: "Section 125", title: "Abetment of sedition", description: "Abetting sedition is punishable with the same penalties as sedition." },
  { id: "126", section: "Section 126", title: "Membership of unlawful assembly", description: "Being a member of unlawful assembly with intent to commit an offence is punishable." },
  { id: "127", section: "Section 127", title: "Being present at unlawful assembly", description: "Being present at unlawful assembly knowing intent to commit offence is punishable." },
  { id: "128", section: "Section 128", title: "Rioting", description: "Using force in an unlawful assembly is punishable with imprisonment or fine." },
  { id: "129", section: "Section 129", title: "Joining armed unlawful assembly", description: "Joining an armed unlawful assembly is punishable with imprisonment up to two years or fine." },
  { id: "130", section: "Section 130", title: "Assaulting government officers", description: "Assaulting public servants in execution of duty is punishable with imprisonment and/or fine." },
  { id: "131", section: "Section 131", title: "Punishment for abetment of riot", description: "Abetment of riot is punishable with imprisonment or fine." },
  { id: "132", section: "Section 132", title: "Punishment for waging war", description: "Waging war against the government carries life imprisonment or death penalty." },
  { id: "133", section: "Section 133", title: "Punishment for spreading fear of war", description: "Promoting fear of war against India is punishable." },
  { id: "134", section: "Section 134", title: "Abetment of mutiny", description: "Abetting mutiny or insubordination in armed forces is punishable with imprisonment." },
  { id: "135", section: "Section 135", title: "Rioting armed with deadly weapon", description: "Participating in armed riots is punishable with imprisonment or fine." },
  { id: "136", section: "Section 136", title: "Rioting with threat of death", description: "Using threat of death in riots is punishable with imprisonment or fine." },
  { id: "137", section: "Section 137", title: "Abetment of riotous assembly", description: "Instigating riotous assembly is punishable." },
  { id: "138", section: "Section 138", title: "Abetment of armed riot", description: "Abetting armed riot is punishable with imprisonment or fine." },
  { id: "139", section: "Section 139", title: "Being member of an armed assembly", description: "Being a member of an armed assembly intending violence is punishable." },
  { id: "140", section: "Section 140", title: "Punishment for rioting", description: "Participation in riots is punishable with imprisonment or fine." },
  { id: "141", section: "Section 141", title: "Unlawful assembly", description: "Assembly of 5+ people with common illegal objective is unlawful and punishable." },
  { id: "142", section: "Section 142", title: "Punishment for assembly with deadly weapon", description: "Assembly armed with deadly weapon is punishable with imprisonment or fine." },
  { id: "143", section: "Section 143", title: "Being member of unlawful assembly", description: "Membership of unlawful assembly is punishable with imprisonment or fine." },
  { id: "144", section: "Section 144", title: "Joining unlawful assembly armed with deadly weapon", description: "Members of armed unlawful assembly are punishable with imprisonment or fine." },
  { id: "145", section: "Section 145", title: "Abetment of illegal assembly", description: "Instigating or assisting an illegal assembly is punishable." },
  { id: "146", section: "Section 146", title: "Rioting", description: "Every member of a rioting assembly is punishable with imprisonment or fine." },
  { id: "147", section: "Section 147", title: "Punishment for rioting", description: "Rioting is punishable with imprisonment up to 2 years or fine or both." },
  { id: "148", section: "Section 148", title: "Rioting armed with deadly weapon", description: "Rioting while armed is punishable with imprisonment up to 3 years or fine or both." },
  { id: "149", section: "Section 149", title: "Every member liable for offence committed in prosecution of common object", description: "All members of unlawful assembly are liable for offences committed in pursuit of common objective." },
  { id: "150", section: "Section 150", title: "Punishment for abetment of offence by unlawful assembly", description: "Abetment of crime by unlawful assembly is punishable with same penalties as principal offence." },
  { id: "151", section: "Section 151", title: "Being member of unlawful assembly intending to commit offence", description: "Joining an assembly intending to commit a crime is punishable." },
  { id: "152", section: "Section 152", title: "Refusing to disperse when ordered by public servant", description: "Failure to disperse when ordered is punishable." },
  { id: "153", section: "Section 153", title: "Promoting enmity between different groups", description: "Acts promoting hatred between groups based on religion, race, or community are punishable." },
  { id: "153A", section: "Section 153A", title: "Promoting enmity and acts prejudicial to maintenance of harmony", description: "Spreading enmity or insulting groups to disturb harmony is punishable with imprisonment and fine." },
  { id: "153B", section: "Section 153B", title: "Imputations, assertions prejudicial to national integration", description: "Statements undermining national integrity are punishable." },
  { id: "154", section: "Section 154", title: "Information in cases of cognizable offence", description: "Procedure for lodging FIR or complaint for cognizable offences." },
  { id: "155", section: "Section 155", title: "Refusing to furnish information", description: "Refusing to give information to public servant when legally required is punishable." },
  { id: "156", section: "Section 156", title: "Power of police to investigate", description: "Police have authority to investigate cognizable offences without magistrate order." },
  { id: "157", section: "Section 157", title: "Proceedings in case of cognizable offence", description: "Police must investigate upon receiving information about cognizable offence." },
  { id: "158", section: "Section 158", title: "Police inquiry", description: "Police may inquire into offences even without FIR in certain circumstances." },
  { id: "159", section: "Section 159", title: "Complaint to magistrate if no FIR lodged", description: "Magistrate may order investigation if police refuse to lodge FIR." },
  { id: "160", section: "Section 160", title: "Police may require attendance of witnesses", description: "Police can summon witnesses for investigation." },
  { id: "161", section: "Section 161", title: "Examination of witnesses by police", description: "Police may record statements of witnesses during investigation." },
  { id: "162", section: "Section 162", title: "Statements not to be signed by accused", description: "Accused cannot be compelled to sign statements made to police." },
  { id: "163", section: "Section 163", title: "Confession to police not to be used", description: "Confession made to police cannot be used as evidence unless recorded in court." },
  { id: "164", section: "Section 164", title: "Recording of confessions and statements", description: "Magistrate may record statements or confessions for legal proceedings." },
  { id: "165", section: "Section 165", title: "Fabricating false evidence", description: "Fabricating false evidence is punishable with imprisonment and/or fine." },
  { id: "166", section: "Section 166", title: "Public servant disobeying law", description: "Public servant refusing to perform lawful duty is punishable." },
  { id: "167", section: "Section 167", title: "Detention of accused by police", description: "Limits on police detention without magistrate’s order." },
  { id: "168", section: "Section 168", title: "Refusal to record statement", description: "Refusing to record statements by magistrate is punishable." },
  { id: "169", section: "Section 169", title: "Person disobeying summons or order of magistrate", description: "Ignoring magistrate’s order or summons is punishable." },
  { id: "170", section: "Section 170", title: "Person disobeying summons of public servant", description: "Failure to comply with summons issued by lawful authority is punishable." },
  { id: "171", section: "Section 171", title: "Definition of offences relating to elections", description: "Explains what actions constitute offences in election context." },
  { id: "171A", section: "Section 171A", title: "Punishment for bribery at election", description: "Offering or accepting bribes in elections is punishable with imprisonment or fine." },
  { id: "171B", section: "Section 171B", title: "Personation at election", description: "Voting as another person is punishable with imprisonment or fine." },
  { id: "171C", section: "Section 171C", title: "Illegal payments in elections", description: "Illegal inducements to voters are punishable." },
  { id: "172", section: "Section 172", title: "Refusing to answer public servant’s questions", description: "Failure to answer lawful questions of public servant is punishable." },
  { id: "173", section: "Section 173", title: "Report of police officer on completion of investigation", description: "Police must submit final report of investigation to magistrate." },
  { id: "174", section: "Section 174", title: "Police to inquire into suicide or unnatural death", description: "Police must investigate suicides or suspicious deaths." },
  { id: "175", section: "Section 175", title: "Omission to report death", description: "Failure to report death or suspicious circumstances is punishable." },
  { id: "176", section: "Section 176", title: "Refusal to aid public servant", description: "Refusing to assist a lawful public servant is punishable." },
  { id: "177", section: "Section 177", title: "Furnishing false information", description: "Giving false information to public servant is punishable." },
  { id: "178", section: "Section 178", title: "False certificate by public servant", description: "Public servant giving false certificate knowingly is punishable." },
  { id: "179", section: "Section 179", title: "False statement in declaration made under law", description: "Making false statements in legal declarations is punishable." },
  { id: "180", section: "Section 180", title: "Refusing to sign statement", description: "Refusal to sign a lawful statement when required is punishable." },
  { id: "181", section: "Section 181", title: "Punishment for false statement in writing", description: "Writing false statements intending to mislead is punishable." },
  { id: "182", section: "Section 182", title: "False information with intent to cause public servant to use lawful power improperly", description: "Giving false info to mislead a public servant is punishable." },
  { id: "183", section: "Section 183", title: "Punishment for false evidence", description: "Providing false evidence is punishable with imprisonment or fine." },
  { id: "184", section: "Section 184", title: "Obstructing public servant", description: "Obstructing lawful duty of public servant is punishable." },
  { id: "185", section: "Section 185", title: "Failure to produce document", description: "Failure to produce legally required documents is punishable." },
  { id: "186", section: "Section 186", title: "Obstructing public servant in discharge of public functions", description: "Obstruction of public servant in performance of lawful duties is punishable." },
  { id: "187", section: "Section 187", title: "False certificate or entry", description: "Making false entry or certificate to mislead is punishable." },
  { id: "188", section: "Section 188", title: "Disobedience to order duly promulgated by public servant", description: "Ignoring lawful order is punishable with fine or imprisonment." },
  { id: "189", section: "Section 189", title: "False statement made in declaration", description: "False declarations under law are punishable." },
  { id: "190", section: "Section 190", title: "Cognizance of offences by magistrates", description: "Magistrate may take cognizance of offences on receiving information or complaint." },
  { id: "191", section: "Section 191", title: "Giving false evidence", description: "Knowingly giving false evidence in court is punishable." },
  { id: "192", section: "Section 192", title: "Fabricating false evidence", description: "Fabricating evidence to mislead judicial proceedings is punishable." },
  { id: "193", section: "Section 193", title: "Punishment for false evidence", description: "Giving or fabricating false evidence is punishable with imprisonment or fine." },
  { id: "194", section: "Section 194", title: "False statement in declaration for revenue, etc.", description: "False statements to mislead authorities in matters like taxes are punishable." },
  { id: "195", section: "Section 195", title: "Prosecution for offences against the State", description: "Prosecution for certain offences against the State requires government sanction." },
  { id: "196", section: "Section 196", title: "Offences by or relating to public servants", description: "Special provisions apply to offences by public servants." },
  { id: "197", section: "Section 197", title: "Prosecution of Judges and public servants", description: "Government sanction required to prosecute judges or public servants." },
  { id: "198", section: "Section 198", title: "Prosecution for defamation", description: "Government sanction required to prosecute for defamation in certain cases." },
  { id: "199", section: "Section 199", title: "Prosecution for defamation", description: "Special provisions for complaints relating to defamation and government officials." },
  { id: "200", section: "Section 200", title: "Examining complainant", description: "Magistrate must examine complainant to determine whether to proceed with investigation." },
  { id: "201", section: "Section 201", title: "Causing disappearance of evidence", description: "Destroying evidence to help offender escape is punishable." },
  { id: "202", section: "Section 202", title: "Intentional omission to give information of offence by person bound to inform", description: "Not reporting a known offence is punishable." },
  { id: "203", section: "Section 203", title: "Giving false information respecting an offence committed", description: "Giving false info to public servant about an offence is punishable." },
  { id: "204", section: "Section 204", title: "Intentional omission to give information to public servant", description: "Omitting to give info to a public servant is punishable if legally required." },
  { id: "205", section: "Section 205", title: "Omission to give information relating to certain offences", description: "Failure to report specific serious offences is punishable." },
  { id: "206", section: "Section 206", title: "False charge of offence made with intent to injure", description: "Making a false accusation to harm someone is punishable." },
  { id: "207", section: "Section 207", title: "Fraudulent charge of offence with intent to injure", description: "Filing a fraudulent charge intending to harm someone is punishable." },
  { id: "208", section: "Section 208", title: "Disobedience to order duly promulgated by public servant", description: "Ignoring lawful public orders is punishable." },
  { id: "209", section: "Section 209", title: "Proceedings for offences punishable with imprisonment up to 2 years", description: "Magistrate may take cognizance of minor offences." },
  { id: "210", section: "Section 210", title: "Proceedings in cases where offences are punishable with imprisonment exceeding 2 years", description: "Magistrate may take cognizance of serious offences." },
  { id: "211", section: "Section 211", title: "False charge of offence made with intent to injure", description: "Making a false charge to injure someone is punishable." },
  { id: "212", section: "Section 212", title: "Harbouring offender", description: "Harbouring or helping a known offender is punishable." },
  { id: "213", section: "Section 213", title: "Harbouring offender with intent to help escape", description: "Helping an offender evade justice is punishable." },
  { id: "214", section: "Section 214", title: "Abetment of offence by omission", description: "Omitting to prevent a crime when legally bound is punishable." },
  { id: "215", section: "Section 215", title: "Omission to give information of certain offences", description: "Failure to report serious offences like murder is punishable." },
  { id: "216", section: "Section 216", title: "Liability of person for offences committed by another", description: "Persons may be liable for crimes committed by others under certain conditions." },
  { id: "217", section: "Section 217", title: "Abetment of offences", description: "Instigating, aiding, or conspiring to commit crime is punishable." },
  { id: "218", section: "Section 218", title: "Concealing design against public servant", description: "Hiding intentions to commit offence against public servant is punishable." },
  { id: "219", section: "Section 219", title: "Abetment of mutiny", description: "Abetting mutiny in armed forces is punishable." },
  { id: "220", section: "Section 220", title: "Abetment of suicide", description: "Abetting someone to commit suicide is punishable with imprisonment or fine." },
  { id: "221", section: "Section 221", title: "Concealment of design to commit offence", description: "Hiding intention to commit an offence is punishable." },
  { id: "222", section: "Section 222", title: "Punishment for concealing design to commit offence", description: "Concealing a crime’s design is punishable." },
  { id: "223", section: "Section 223", title: "Abetment of offence by omission", description: "Omitting to act to prevent crime is punishable." },
  { id: "224", section: "Section 224", title: "Abetment of culpable homicide", description: "Abetting culpable homicide is punishable with same penalties." },
  { id: "225", section: "Section 225", title: "Abetment of murder", description: "Abetting murder is punishable with imprisonment or death." },
  { id: "226", section: "Section 226", title: "Mischief", description: "Intentional destruction or damage to property is punishable." },
  { id: "227", section: "Section 227", title: "Causing miscarriage", description: "Causing miscarriage without consent is punishable." },
  { id: "228", section: "Section 228", title: "Unlawful detention", description: "Detaining a person unlawfully is punishable." },
  { id: "229", section: "Section 229", title: "Injury to life or health of person", description: "Causing injury to health or life is punishable." },
  { id: "230", section: "Section 230", title: "Punishment for causing hurt", description: "Causing hurt to someone is punishable with imprisonment or fine." },
  { id: "231", section: "Section 231", title: "Voluntarily causing grievous hurt", description: "Causing serious bodily harm intentionally is punishable with imprisonment or fine." },
  { id: "232", section: "Section 232", title: "Voluntarily causing hurt with dangerous weapons", description: "Hurt caused with weapon is punishable." },
  { id: "233", section: "Section 233", title: "Punishment for wrongful restraint", description: "Wrongfully restraining someone is punishable." },
  { id: "234", section: "Section 234", title: "Wrongful confinement", description: "Unlawfully confining someone is punishable with imprisonment or fine." },
  { id: "235", section: "Section 235", title: "Abetment of wrongful confinement", description: "Helping someone confine another unlawfully is punishable." },
  { id: "236", section: "Section 236", title: "Punishment for habitual offences", description: "Habitual offenders may face stricter punishment." },
  { id: "237", section: "Section 237", title: "Negligence", description: "Negligent acts causing harm are punishable." },
  { id: "238", section: "Section 238", title: "Voluntarily causing hurt or death by negligence", description: "Negligent acts causing hurt or death are punishable." },
  { id: "239", section: "Section 239", title: "Rash driving", description: "Driving rashly or negligently causing harm is punishable." },
  { id: "240", section: "Section 240", title: "Endangering life or personal safety of others", description: "Acts that endanger others’ life or safety are punishable." },
  { id: "241", section: "Section 241", title: "Causing death by negligent act", description: "Death caused by negligence is punishable." },
  { id: "242", section: "Section 242", title: "Causing hurt by negligent act", description: "Hurt caused by negligence is punishable." },
  { id: "243", section: "Section 243", title: "Negligent conduct with respect to machinery", description: "Negligent use of machinery causing harm is punishable." },
  { id: "244", section: "Section 244", title: "Negligent firing of firearms", description: "Negligent firing causing injury or death is punishable." },
  { id: "245", section: "Section 245", title: "Attempt to commit offence", description: "Attempting to commit an offence is punishable even if not completed." },
  { id: "246", section: "Section 246", title: "Preparation to commit offence", description: "Planning or preparing to commit crime is punishable." },
  { id: "247", section: "Section 247", title: "Intentional concealment of crime", description: "Hiding a crime or offender is punishable." },
  { id: "248", section: "Section 248", title: "Harbouring offenders", description: "Helping offenders to evade law is punishable." },
  { id: "249", section: "Section 249", title: "Criminal conspiracy", description: "Conspiring to commit an offence is punishable with imprisonment or fine." },
  { id: "250", section: "Section 250", title: "Abetment of offences", description: "Abetting offences, by instigation or aid, is punishable." },
  { id: "251", section: "Section 251", title: "Offences relating to public servant", description: "Acts by or against public servants affecting law enforcement are punishable." },
  { id: "252", section: "Section 252", title: "Assaulting public servant", description: "Assaulting a public servant in duty is punishable." },
  { id: "253", section: "Section 253", title: "Sale of obscene books", description: "Selling obscene material is punishable." },
  { id: "254", section: "Section 254", title: "Use of obscene objects to corrupt public morals", description: "Using obscene materials to corrupt morals is punishable." },
  { id: "255", section: "Section 255", title: "Obscene acts in public", description: "Performing obscene acts in public is punishable." },
  { id: "256", section: "Section 256", title: "Trespass after preparation for hurt, assault, or wrongful restraint", description: "Trespassing intending to commit harm is punishable." },
  { id: "257", section: "Section 257", title: "Going armed for offensive purposes", description: "Carrying weapons intending to harm is punishable." },
  { id: "258", section: "Section 258", title: "Public nuisance", description: "Creating nuisance or danger to the public is punishable." },
  { id: "259", section: "Section 259", title: "Intentional damage to public property", description: "Intentionally damaging public property is punishable." },
  { id: "260", section: "Section 260", title: "Trespass in order to commit offence", description: "Trespassing to commit offence is punishable." },
  { id: "261", section: "Section 261", title: "Attempt to commit offence by trespass", description: "Attempting a crime via trespass is punishable." },
  { id: "262", section: "Section 262", title: "Using means to commit injury", description: "Using weapons or tools to cause injury is punishable." },
  { id: "263", section: "Section 263", title: "Voluntarily causing hurt", description: "Intentionally causing hurt to another is punishable." },
  { id: "264", section: "Section 264", title: "Voluntarily causing grievous hurt", description: "Causing serious bodily harm intentionally is punishable." },
  { id: "265", section: "Section 265", title: "Hurt by dangerous weapons", description: "Causing hurt with weapons is punishable." },
  { id: "266", section: "Section 266", title: "Act endangering life or personal safety of others", description: "Endangering life or safety of others is punishable." },
  { id: "267", section: "Section 267", title: "Act causing risk to human life or health", description: "Acts creating risk to life or health are punishable." },
  { id: "268", section: "Section 268", title: "Public nuisance", description: "Causing public nuisance is punishable with fine." },
  { id: "269", section: "Section 269", title: "Negligent act likely to spread infection of disease dangerous to life", description: "Negligent acts spreading dangerous disease are punishable." },
  { id: "270", section: "Section 270", title: "Malignant act likely to spread infection", description: "Deliberate acts spreading dangerous disease are punishable." },
  { id: "271", section: "Section 271", title: "Disobedience to quarantine rules", description: "Disobeying quarantine or epidemic rules is punishable." },
  { id: "272", section: "Section 272", title: "Adulteration of food or drink intended for sale", description: "Selling adulterated food or drink is punishable." },
  { id: "273", section: "Section 273", title: "Sale of noxious food or drink", description: "Selling harmful food or drink is punishable." },
  { id: "274", section: "Section 274", title: "Making atmosphere noxious to health", description: "Creating noxious air harmful to health is punishable." },
  { id: "275", section: "Section 275", title: "Smoking in public places", description: "Smoking in prohibited public areas is punishable." },
  { id: "276", section: "Section 276", title: "Punishment for neglecting public health rules", description: "Neglecting health rules is punishable with fine or imprisonment." },
  { id: "277", section: "Section 277", title: "Fouling water of public spring or reservoir", description: "Polluting water sources is punishable." },
  { id: "278", section: "Section 278", title: "Making atmosphere noxious to health", description: "Polluting air to harm health is punishable." },
  { id: "279", section: "Section 279", title: "Rash driving or riding on public way", description: "Driving or riding recklessly endangering people is punishable." },
  { id: "280", section: "Section 280", title: "Driving a vehicle so as to endanger human life", description: "Endangering life while driving is punishable." },
  { id: "281", section: "Section 281", title: "Negligent driving", description: "Negligent driving causing hurt or damage is punishable." },
  { id: "282", section: "Section 282", title: "Causing hurt by negligent act", description: "Causing hurt due to negligence is punishable." },
  { id: "283", section: "Section 283", title: "Negligent conduct with respect to dangerous things", description: "Negligent handling of dangerous things causing harm is punishable." },
  { id: "284", section: "Section 284", title: "Negligent act likely to cause danger to life or personal safety", description: "Negligent acts risking life or safety are punishable." },
  { id: "285", section: "Section 285", title: "Negligent conduct with respect to fire or combustible matter", description: "Negligent acts involving fire or explosives causing danger are punishable." },
  { id: "286", section: "Section 286", title: "Negligent conduct with respect to poison", description: "Negligent handling of poison causing danger is punishable." },
  { id: "287", section: "Section 287", title: "Negligent conduct with respect to poisonous substance", description: "Negligent acts with poison endangering health are punishable." },
  { id: "288", section: "Section 288", title: "Negligent act causing public danger", description: "Negligent acts creating public danger are punishable." },
  { id: "289", section: "Section 289", title: "Negligent act likely to spread infection", description: "Negligent acts spreading disease are punishable." },
  { id: "290", section: "Section 290", title: "Punishment for public nuisance", description: "Causing public nuisance is punishable with fine." },
  { id: "291", section: "Section 291", title: "Negligent act causing hurt", description: "Negligent acts causing hurt are punishable." },
  { id: "292", section: "Section 292", title: "Sale, etc., of obscene books and material", description: "Selling obscene material is punishable." },
  { id: "293", section: "Section 293", title: "Sale of obscene objects to young person", description: "Selling obscene material to minors is punishable." },
  { id: "294", section: "Section 294", title: "Obscene acts and songs in public", description: "Performing obscene acts or singing obscene songs in public is punishable." },
  { id: "295", section: "Section 295", title: "Injuring or defiling place of worship with intent to insult religion", description: "Damaging religious places to insult religion is punishable." },
  { id: "295A", section: "Section 295A", title: "Deliberate and malicious acts intended to outrage religious feelings", description: "Intentionally insulting religion is punishable with imprisonment or fine." },
  { id: "296", section: "Section 296", title: "Disturbing religious assembly", description: "Disturbing religious gatherings is punishable." },
  { id: "297", section: "Section 297", title: "Trespass on burial places, etc.", description: "Trespassing on burial or sacred places is punishable." },
  { id: "298", section: "Section 298", title: "Uttering words with deliberate intent to wound religious feelings", description: "Using offensive words to insult religion is punishable." },
  { id: "299", section: "Section 299", title: "Culpable homicide", description: "Causing death with intention or knowledge of likely death is punishable." },
  { id: "300", section: "Section 300", title: "Murder", description: "Culpable homicide is murder if done with intent or knowledge to cause death." },
  { id: "301", section: "Section 301", title: "Culpable homicide by life-convict", description: "A person serving life imprisonment committing homicide is punishable." },
  { id: "302", section: "Section 302", title: "Punishment for murder", description: "Murder is punishable with death or life imprisonment, and fine." },
  { id: "303", section: "Section 303", title: "Punishment for murder of person under sentence of death", description: "Killing a person under death sentence is punishable with death." },
  { id: "304", section: "Section 304", title: "Punishment for culpable homicide not amounting to murder", description: "Causing death without intention of murder is punishable with 10 years or less." },
  { id: "304A", section: "Section 304A", title: "Causing death by negligence", description: "Death caused by negligence is punishable with up to 2 years or fine." },
  { id: "305", section: "Section 305", title: "Abetment of suicide of child or insane person", description: "Abetting suicide of minor or insane person is punishable." },
  { id: "306", section: "Section 306", title: "Abetment of suicide", description: "Abetting suicide of any person is punishable." },
  { id: "307", section: "Section 307", title: "Attempt to murder", description: "Attempting to murder is punishable with up to 10 years or life imprisonment if hurt occurs." },
  { id: "308", section: "Section 308", title: "Attempt to commit culpable homicide", description: "Attempting culpable homicide is punishable." },
  { id: "309", section: "Section 309", title: "Attempt to commit suicide", description: "Attempting suicide is punishable with fine or imprisonment up to 1 year." },
  { id: "310", section: "Section 310", title: "Death caused by act done with intent to cause death", description: "Death caused by intentional act is punishable as culpable homicide." },
  { id: "311", section: "Section 311", title: "Liability for acts done in good faith for benefit of person", description: "Acts done in good faith causing harm have limited liability." },
  { id: "312", section: "Section 312", title: "Causing miscarriage", description: "Causing miscarriage without consent is punishable." },
  { id: "313", section: "Section 313", title: "Causing miscarriage by consent", description: "Causing miscarriage with consent is punishable if done unlawfully." },
  { id: "314", section: "Section 314", title: "Death caused by act done with intent to cause miscarriage", description: "Causing death while attempting miscarriage is punishable." },
  { id: "315", section: "Section 315", title: "Act done with intent to prevent child being born alive", description: "Harmful acts intending to prevent birth are punishable." },
  { id: "316", section: "Section 316", title: "Death caused by act done with intent to prevent child being born alive", description: "Death caused while preventing child birth is punishable." },
  { id: "317", section: "Section 317", title: "Causing miscarriage without woman's consent", description: "Causing miscarriage without consent is punishable with imprisonment." },
  { id: "318", section: "Section 318", title: "Wrongful confinement of woman", description: "Wrongfully confining a woman is punishable." },
  { id: "319", section: "Section 319", title: "Hurt", description: "Causing bodily pain, disease, or infirmity is hurt." },
  { id: "320", section: "Section 320", title: "Grievous hurt", description: "Serious hurt like emasculation, sight loss, fractures, etc., is grievous hurt." },
  { id: "321", section: "Section 321", title: "Voluntarily causing hurt", description: "Intentionally causing hurt is punishable." },
  { id: "322", section: "Section 322", title: "Voluntarily causing grievous hurt", description: "Intentionally causing grievous hurt is punishable with severe punishment." },
  { id: "323", section: "Section 323", title: "Punishment for voluntarily causing hurt", description: "Voluntarily causing hurt is punishable with 1 year or fine or both." },
  { id: "324", section: "Section 324", title: "Voluntarily causing hurt by dangerous weapons", description: "Hurt caused using dangerous weapons is punishable." },
  { id: "325", section: "Section 325", title: "Punishment for voluntarily causing grievous hurt", description: "Causing grievous hurt voluntarily is punishable with up to 7 years." },
  { id: "326", section: "Section 326", title: "Voluntarily causing grievous hurt by dangerous weapons or means", description: "Causing grievous hurt with weapon is punishable with severe imprisonment." },
  { id: "327", section: "Section 327", title: "Voluntarily causing hurt to extort property, etc.", description: "Hurt to extort property is punishable." },
  { id: "328", section: "Section 328", title: "Causing hurt to extort confession, etc.", description: "Hurt to force confession is punishable." },
  { id: "329", section: "Section 329", title: "Voluntarily causing grievous hurt to extort property, etc.", description: "Grievous hurt to extort property is punishable." },
  { id: "330", section: "Section 330", title: "Voluntarily causing grievous hurt to extort confession, etc.", description: "Grievous hurt to force confession is punishable." },
  { id: "331", section: "Section 331", title: "Voluntarily causing grievous hurt to deter public servant", description: "Hurting to deter public servant is punishable." },
  { id: "332", section: "Section 332", title: "Voluntarily causing hurt to deter public servant", description: "Causing hurt to prevent a public servant from duty is punishable." },
  { id: "333", section: "Section 333", title: "Punishment for voluntarily causing grievous hurt to deter public servant", description: "Grievous hurt to deter public servant is punishable with imprisonment." },
  { id: "334", section: "Section 334", title: "Punishment for voluntarily causing hurt to deter public servant", description: "Hurt to deter public servant is punishable." },
  { id: "335", section: "Section 335", title: "Act endangering life or personal safety of others", description: "Acts endangering life or safety are punishable." },
  { id: "336", section: "Section 336", title: "Act endangering life or personal safety of others by rash or negligent act", description: "Rash or negligent acts endangering life are punishable." },
  { id: "337", section: "Section 337", title: "Causing hurt by rash or negligent act", description: "Rash or negligent acts causing hurt are punishable." },
  { id: "338", section: "Section 338", title: "Causing grievous hurt by rash or negligent act", description: "Rash or negligent acts causing grievous hurt are punishable." },
  { id: "339", section: "Section 339", title: "Wrongful restraint", description: "Wrongfully restraining someone is punishable." },
  { id: "340", section: "Section 340", title: "Wrongful confinement", description: "Unlawfully confining someone is punishable." },
  { id: "341", section: "Section 341", title: "Punishment for wrongful restraint", description: "Wrongful restraint is punishable with fine or imprisonment." },
  { id: "342", section: "Section 342", title: "Punishment for wrongful confinement", description: "Wrongful confinement is punishable with imprisonment or fine." },
  { id: "343", section: "Section 343", title: "Wrongful confinement for extorting property", description: "Confining someone to extort property is punishable." },
  { id: "344", section: "Section 344", title: "Wrongful confinement to extort confession, etc.", description: "Confining to force confession is punishable." },
  { id: "345", section: "Section 345", title: "Wrongful confinement to deter public servant", description: "Confining to prevent public servant from duty is punishable." },
  { id: "346", section: "Section 346", title: "Punishment for wrongful confinement of a person under 14", description: "Confining a minor is punishable." },
  { id: "347", section: "Section 347", title: "Wrongful confinement by abduction", description: "Confining someone by abduction is punishable." },
  { id: "348", section: "Section 348", title: "Abduction to compel marriage", description: "Abduction to force marriage is punishable." },
  { id: "349", section: "Section 349", title: "Force to commit theft, etc.", description: "Using force to commit theft or similar offences is punishable." },
  { id: "350", section: "Section 350", title: "Assault or criminal force with intent to outrage modesty", description: "Assault or force with intent to outrage modesty is punishable." },
  { id: "351", section: "Section 351", title: "Assault", description: "Attempting or threatening to use force against someone." },
  { id: "352", section: "Section 352", title: "Punishment for assault or use of criminal force otherwise than on grave provocation", description: "Assault or force without serious provocation is punishable with fine or imprisonment." },
  { id: "353", section: "Section 353", title: "Assault or criminal force to deter public servant", description: "Using force to prevent a public servant from duty is punishable." },
  { id: "354", section: "Section 354", title: "Assault or criminal force to woman with intent to outrage her modesty", description: "Assaulting or using force on a woman intending to outrage modesty is punishable." },
  { id: "354A", section: "Section 354A", title: "Sexual harassment and punishment for sexual harassment", description: "Sexual harassment of a woman is punishable." },
  { id: "354B", section: "Section 354B", title: "Assault or use of criminal force to woman with intent to disrobe", description: "Forcibly disrobing a woman is punishable." },
  { id: "354C", section: "Section 354C", title: "Voyeurism", description: "Watching or capturing a woman’s private acts without consent is punishable." },
  { id: "354D", section: "Section 354D", title: "Stalking", description: "Stalking a woman in a way causing fear or distress is punishable." },
  { id: "355", section: "Section 355", title: "Threat or use of force against the State", description: "Threatening or using force against the State is punishable." },
  { id: "356", section: "Section 356", title: "Punishment for assault on public servant", description: "Assaulting public servants is punishable." },
  { id: "357", section: "Section 357", title: "Abetment of assault", description: "Abetting an assault is punishable." },
  { id: "358", section: "Section 358", title: "Kidnapping", description: "Abducting or moving someone against their will is punishable." },
  { id: "359", section: "Section 359", title: "Kidnapping from lawful guardianship", description: "Taking someone from legal guardianship without consent is punishable." },
  { id: "360", section: "Section 360", title: "Kidnapping from lawful guardianship of a minor or insane person", description: "Kidnapping a minor or insane person is punishable." },
  { id: "361", section: "Section 361", title: "Kidnapping from lawful guardianship", description: "Taking a child or ward away from lawful guardianship without consent is punishable." },
  { id: "362", section: "Section 362", title: "Abduction", description: "Taking a person away forcibly or deceitfully is punishable." },
  { id: "363", section: "Section 363", title: "Punishment for kidnapping", description: "Kidnapping is punishable with imprisonment up to 7 years." },
  { id: "364", section: "Section 364", title: "Kidnapping or abducting in order to murder", description: "Kidnapping to murder is punishable with death or life imprisonment." },
  { id: "365", section: "Section 365", title: "Kidnapping or abducting with intent to secretly confine", description: "Kidnapping to confine someone secretly is punishable." },
  { id: "366", section: "Section 366", title: "Kidnapping, abducting or inducing woman to compel marriage or sexual intercourse", description: "Abducting or enticing a woman for marriage or sexual intercourse is punishable." },
  { id: "366A", section: "Section 366A", title: "Procuration of minor girls", description: "Enticing or forcing a minor girl for sexual purposes is punishable." },
  { id: "366B", section: "Section 366B", title: "Importation of girl from foreign country", description: "Importing a girl from abroad for immoral purposes is punishable." },
  { id: "367", section: "Section 367", title: "Kidnapping or abducting in order to steal", description: "Kidnapping to commit theft is punishable." },
  { id: "368", section: "Section 368", title: "Kidnapping or abducting to extort ransom", description: "Kidnapping for ransom is punishable with severe imprisonment." },
  { id: "369", section: "Section 369", title: "Kidnapping or abducting child under 10 years with intent to steal", description: "Kidnapping a child under 10 for theft is punishable." },
  { id: "370", section: "Section 370", title: "Trafficking of persons", description: "Trafficking or forcing persons for exploitation is punishable." },
  { id: "371", section: "Section 371", title: "Habitual dealing in slaves", description: "Dealing in slaves is punishable." },
  { id: "372", section: "Section 372", title: "Buying minor for purposes of prostitution, etc.", description: "Buying a minor for sexual exploitation is punishable." },
  { id: "373", section: "Section 373", title: "Selling minor for purposes of prostitution, etc.", description: "Selling a minor for sexual exploitation is punishable." },
  { id: "374", section: "Section 374", title: "Unlawful compulsory labor", description: "Forcing someone into labor is punishable." },
  { id: "375", section: "Section 375", title: "Rape", description: "A man committing sexual penetration without consent is guilty of rape." },
  { id: "376", section: "Section 376", title: "Punishment for rape", description: "Rape is punishable with rigorous imprisonment, up to life." },
  { id: "376A", section: "Section 376A", title: "Punishment for causing death or resultant rape", description: "Rape causing death is punishable with severe penalties." },
  { id: "376B", section: "Section 376B", title: "Punishment for sexual intercourse by public servant", description: "Public servant committing sexual act with person under authority is punishable." },
  { id: "376C", section: "Section 376C", title: "Sexual intercourse by person in authority", description: "Person in authority sexually exploiting subordinate is punishable." },
  { id: "376D", section: "Section 376D", title: "Gang rape", description: "Gang rape is punishable with severe imprisonment." },
  { id: "377", section: "Section 377", title: "Unnatural offences", description: "Sexual acts against order of nature are punishable." },
  { id: "378", section: "Section 378", title: "Theft", description: "Dishonestly taking someone else's movable property is theft." },
  { id: "379", section: "Section 379", title: "Punishment for theft", description: "Theft is punishable with imprisonment or fine." },
  { id: "380", section: "Section 380", title: "Theft in dwelling house, etc.", description: "Theft in dwelling or property is punishable with higher imprisonment." },
  { id: "381", section: "Section 381", title: "Theft by clerk or servant of property in possession of master", description: "Clerks or servants stealing from master is punishable." },
  { id: "382", section: "Section 382", title: "Theft after preparation made for causing death, hurt, or restraint", description: "Theft after preparing to hurt is punishable." },
  { id: "383", section: "Section 383", title: "Extortion", description: "Obtaining property by threat or force is extortion." },
  { id: "384", section: "Section 384", title: "Punishment for extortion", description: "Extortion is punishable with imprisonment or fine." },
  { id: "385", section: "Section 385", title: "Putting person in fear of injury in order to commit extortion", description: "Threatening someone to extort property is punishable." },
  { id: "386", section: "Section 386", title: "Extortion by putting person in fear of death or grievous hurt", description: "Extortion using fear of death or grievous hurt is punishable." },
  { id: "387", section: "Section 387", title: "Putting person in fear of death or grievous hurt to commit extortion", description: "Putting someone in fear to extort property is punishable." },
  { id: "388", section: "Section 388", title: "Extortion by threat to cause destruction of property", description: "Threatening destruction of property to extort is punishable." },
  { id: "389", section: "Section 389", title: "Extortion by putting person in fear of death or hurt to commit robbery", description: "Extortion using fear to commit robbery is punishable." },
  { id: "390", section: "Section 390", title: "Robbery", description: "Theft using violence or threat is robbery." },
  { id: "391", section: "Section 391", title: "Robbery by five or more persons", description: "Robbery by multiple people is punishable with severe imprisonment." },
  { id: "392", section: "Section 392", title: "Punishment for robbery", description: "Robbery is punishable with rigorous imprisonment up to 10 years." },
  { id: "393", section: "Section 393", title: "Dacoity", description: "Robbery committed by five or more people is dacoity." },
  { id: "394", section: "Section 394", title: "Voluntarily causing death during dacoity", description: "Killing during dacoity is punishable with death or life imprisonment." },
  { id: "395", section: "Section 395", title: "Punishment for dacoity", description: "Dacoity is punishable with rigorous imprisonment up to life." },
  { id: "396", section: "Section 396", title: "Dacoity with murder", description: "Dacoity combined with murder is punishable with death or life imprisonment." },
  { id: "397", section: "Section 397", title: "Robbery or dacoity with attempt to cause death or grievous hurt", description: "Robbery/dacoity with intent to hurt or kill is punishable." },
  { id: "398", section: "Section 398", title: "Attempt to commit robbery or dacoity when armed with deadly weapon", description: "Attempting robbery/dacoity with deadly weapon is punishable." },
  { id: "399", section: "Section 399", title: "House-breaking", description: "Entering property by force or deceit with intent to commit crime is punishable." },
  { id: "400", section: "Section 400", title: "Receiving stolen property", description: "Knowing receipt of stolen property is punishable." },
  { id: "401", section: "Section 401", title: "Dishonest misappropriation of property", description: "Dishonestly taking property entrusted to you is punishable." },
  { id: "402", section: "Section 402", title: "Dishonest misappropriation of property possessed by person by mistake", description: "Taking property possessed by mistake is punishable." },
  { id: "403", section: "Section 403", title: "Dishonest misappropriation of property", description: "Dishonest misappropriation of property is punishable." },
  { id: "404", section: "Section 404", title: "Punishment for dishonest misappropriation of property", description: "Dishonest misappropriation is punishable with imprisonment or fine." },
  { id: "405", section: "Section 405", title: "Criminal breach of trust", description: "Dishonestly using property entrusted to you is criminal breach of trust." },
  { id: "406", section: "Section 406", title: "Punishment for criminal breach of trust", description: "Criminal breach of trust is punishable with up to 3 years or fine." },
  { id: "407", section: "Section 407", title: "Criminal breach of trust by public servant, or by banker, merchant, factor, etc.", description: "Breach of trust by officials or agents is punishable with up to 7 years." },
  { id: "408", section: "Section 408", title: "Criminal breach of trust by clerk or servant", description: "Clerks or servants misusing property are punishable." },
  { id: "409", section: "Section 409", title: "Criminal breach of trust by public servant, banker, merchant, etc.", description: "Severe punishment for breach of trust by certain positions." },
  { id: "410", section: "Section 410", title: "Mischief", description: "Intentional destruction or damage to property is mischief." },
  { id: "411", section: "Section 411", title: "Dishonestly receiving stolen property", description: "Receiving stolen property knowingly is punishable." },
  { id: "412", section: "Section 412", title: "Punishment for dishonestly receiving stolen property", description: "Receiving stolen property is punishable with imprisonment or fine." },
  { id: "413", section: "Section 413", title: "Criminal breach of trust, receiving property", description: "Receiving property obtained by criminal breach of trust is punishable." },
  { id: "414", section: "Section 414", title: "Dishonestly receiving property stolen or obtained by criminal breach of trust", description: "Receiving property obtained dishonestly is punishable." },
  { id: "415", section: "Section 415", title: "Cheating", description: "Deceiving someone to cause loss or harm is cheating." },
  { id: "416", section: "Section 416", title: "Punishment for cheating", description: "Cheating is punishable with imprisonment or fine." },
  { id: "417", section: "Section 417", title: "Punishment for cheating", description: "Cheating intending to induce delivery of property is punishable." },
  { id: "418", section: "Section 418", title: "Cheating with knowledge of dishonesty", description: "Cheating using dishonest knowledge is punishable." },
  { id: "419", section: "Section 419", title: "Punishment for cheating", description: "Cheating is punishable with imprisonment or fine." },
  { id: "420", section: "Section 420", title: "Cheating and dishonestly inducing delivery of property", description: "Cheating causing property delivery is punishable with up to 7 years and fine." },
  { id: "421", section: "Section 421", title: "Dishonest or fraudulent removal or concealment of property", description: "Dishonestly removing or hiding property is punishable." },
  { id: "422", section: "Section 422", title: "Dishonest or fraudulent removal of property", description: "Punishment for fraudulent removal or concealment of property." },
  { id: "423", section: "Section 423", title: "Dishonest misappropriation of property", description: "Misappropriating property dishonestly is punishable." },
  { id: "424", section: "Section 424", title: "Dishonest misappropriation or conversion of property", description: "Punishable for dishonest conversion or misappropriation of property." },
  { id: "425", section: "Section 425", title: "Mischief", description: "Intentional damage to property is mischief." },
  { id: "426", section: "Section 426", title: "Punishment for mischief", description: "Mischief punishable with fine or imprisonment up to 2 years." },
  { id: "427", section: "Section 427", title: "Mischief causing damage to the amount of fifty rupees", description: "Mischief causing significant damage is punishable." },
  { id: "428", section: "Section 428", title: "Mischief by injury to property used for religious purpose", description: "Mischief affecting religious property is punishable." },
  { id: "429", section: "Section 429", title: "Mischief by killing or maiming animal of value", description: "Killing or harming valuable animals is punishable." },
  { id: "430", section: "Section 430", title: "Mischief by wrongful loss or damage to property", description: "Wrongfully causing loss or damage is punishable." },
  { id: "431", section: "Section 431", title: "Criminal breach of trust in relation to property", description: "Breach of trust concerning property is punishable." },
  { id: "432", section: "Section 432", title: "Mischief by causing damage to property used for public service", description: "Damaging property used for public service is punishable." },
  { id: "433", section: "Section 433", title: "Mischief by causing damage to public building", description: "Damaging public buildings is punishable." },
  { id: "434", section: "Section 434", title: "Mischief by injury to works of irrigation", description: "Damaging irrigation works is punishable." },
  { id: "435", section: "Section 435", title: "Mischief by causing damage to property by fire", description: "Setting property on fire intentionally is punishable." },
  { id: "436", section: "Section 436", title: "Mischief by causing damage to house by fire", description: "Intentionally burning house or property is punishable." },
  { id: "437", section: "Section 437", title: "Attempt to commit mischief by fire", description: "Attempting to commit arson is punishable." },
  { id: "438", section: "Section 438", title: "Mischief in attempt to commit mischief by fire", description: "Preparation to commit arson is punishable." },
  { id: "439", section: "Section 439", title: "Punishment for mischief by fire", description: "Arson causing damage is punishable." },
  { id: "440", section: "Section 440", title: "Mischief causing damage to property with explosives", description: "Using explosives to damage property is punishable." },
  { id: "441", section: "Section 441", title: "Criminal trespass", description: "Entering property unlawfully is punishable." },
  { id: "442", section: "Section 442", title: "House-trespass", description: "Trespassing into someone’s home is punishable." },
  { id: "443", section: "Section 443", title: "Punishment for house-trespass", description: "House-trespass is punishable with imprisonment or fine." },
  { id: "444", section: "Section 444", title: "House-trespass in order to commit an offence", description: "Trespassing to commit crime is punishable." },
  { id: "445", section: "Section 445", title: "House-trespass after preparation for hurt, assault, or wrongful restraint", description: "Trespassing with intent to hurt is punishable." },
  { id: "446", section: "Section 446", title: "House-trespass after preparation for theft, robbery, or dacoity", description: "Trespassing for theft or robbery is punishable." },
  { id: "447", section: "Section 447", title: "Punishment for criminal trespass", description: "Criminal trespass is punishable with imprisonment or fine." },
  { id: "448", section: "Section 448", title: "House-trespass with intent to commit offence", description: "Trespassing with intent to commit offence is punishable." },
  { id: "449", section: "Section 449", title: "House-trespass to commit offence punishable with death", description: "Trespassing to commit death-punishable crime is severely punishable." },
  { id: "450", section: "Section 450", title: "House-trespass after preparation to commit murder", description: "Trespassing to prepare for murder is punishable." },
  { id: "451", section: "Section 451", title: "House-trespass by night", description: "Entering someone’s house at night with intent to commit an offence is punishable." },
  { id: "452", section: "Section 452", title: "House-trespass after preparation for hurt, assault, or wrongful restraint", description: "Trespassing with preparation to hurt or restrain is punishable." },
  { id: "453", section: "Section 453", title: "Lurking house-trespass", description: "Trespassing with intent to commit theft, robbery, or dacoity is punishable." },
  { id: "454", section: "Section 454", title: "Lurking house-trespass after preparation for murder, hurt, or theft", description: "Trespassing with intent for murder or theft is punishable." },
  { id: "455", section: "Section 455", title: "Lurking house-trespass after preparation for robbery or dacoity", description: "Trespassing to commit robbery/dacoity is punishable." },
  { id: "456", section: "Section 456", title: "Lurking house-trespass after preparation for hurt or wrongful restraint", description: "Trespassing with intent to harm is punishable." },
  { id: "457", section: "Section 457", title: "Lurking house-trespass after preparation for theft, robbery, or dacoity", description: "Preparation for theft/robbery while trespassing is punishable." },
  { id: "458", section: "Section 458", title: "Lurking house-trespass causing harm", description: "Trespassing at night causing harm is punishable." },
  { id: "459", section: "Section 459", title: "Lurking house-trespass causing death or grievous hurt", description: "Trespassing at night causing death/hurt is severely punishable." },
  { id: "460", section: "Section 460", title: "Lurking house-trespass with intent to commit robbery or dacoity", description: "Trespassing at night for robbery/dacoity is punishable." },
  { id: "461", section: "Section 461", title: "House-breaking", description: "Breaking into a property is punishable." },
  { id: "462", section: "Section 462", title: "House-breaking after preparation for theft, robbery, or dacoity", description: "Breaking to commit theft or robbery is punishable." },
  { id: "463", section: "Section 463", title: "Forgery", description: "Making a false document with intent to cause harm is punishable." },
  { id: "464", section: "Section 464", title: "Making a false document", description: "Creating a document intended to deceive is punishable." },
  { id: "465", section: "Section 465", title: "Punishment for forgery", description: "Forgery is punishable with imprisonment or fine." },
  { id: "466", section: "Section 466", title: "Forgery of record of court or public register", description: "Forging public records is punishable." },
  { id: "467", section: "Section 467", title: "Forgery of valuable security, will, etc.", description: "Forgery of important documents is severely punishable." },
  { id: "468", section: "Section 468", title: "Forgery for purpose of cheating", description: "Forgery intended to cheat is punishable." },
  { id: "469", section: "Section 469", title: "Forgery with intent to harm reputation", description: "Forgery intended to defame is punishable." },
  { id: "470", section: "Section 470", title: "Using forged document", description: "Using a forged document is punishable." },
  { id: "471", section: "Section 471", title: "Using forged document as genuine", description: "Using a forged document believing it to be genuine is punishable." },
  { id: "472", section: "Section 472", title: "Forgery of document for use as genuine", description: "Creating a document for use as genuine is punishable." },
  { id: "473", section: "Section 473", title: "Making or possessing false document for cheating", description: "Possessing false documents for cheating is punishable." },
  { id: "474", section: "Section 474", title: "Using as genuine a forged document", description: "Using forged documents as genuine is punishable." },
  { id: "475", section: "Section 475", title: "Forgery of property documents", description: "Forgery related to property documents is punishable." },
  { id: "476", section: "Section 476", title: "Forgery of valuable security, will, or authority", description: "Forgery of securities, wills, or authority is punishable." },
  { id: "477", section: "Section 477", title: "Falsifying accounts", description: "Altering accounts dishonestly is punishable." },
  { id: "478", section: "Section 478", title: "Forgery of seal of Government or public authority", description: "Forging official seal is punishable." },
  { id: "479", section: "Section 479", title: "Forgery of official documents", description: "Forgery of official documents is punishable." },
  { id: "480", section: "Section 480", title: "Forgery of records", description: "Forgery of records is punishable." },
  { id: "481", section: "Section 481", title: "Forgery of signature", description: "Forgery of signatures is punishable." },
  { id: "482", section: "Section 482", title: "Forgery of electronic records", description: "Falsifying electronic records is punishable." },
  { id: "483", section: "Section 483", title: "Forgery of contracts or agreements", description: "Falsifying contracts or agreements is punishable." },
  { id: "484", section: "Section 484", title: "Forgery of valuable securities", description: "Forgery of securities is punishable." },
  { id: "485", section: "Section 485", title: "Forgery for cheating", description: "Forgery intending to cheat is punishable." },
  { id: "486", section: "Section 486", title: "Forgery for causing loss or damage", description: "Forgery intended to cause loss is punishable." },
  { id: "487", section: "Section 487", title: "Forgery for criminal conspiracy", description: "Forgery as part of conspiracy is punishable." },
  { id: "488", section: "Section 488", title: "Forgery of government stamps", description: "Forgery of stamps is punishable." },
  { id: "489", section: "Section 489", title: "Counterfeiting currency notes or coins", description: "Counterfeiting money is severely punishable." },
  { id: "490", section: "Section 490", title: "Counterfeiting government documents", description: "Counterfeiting official documents is punishable." },
  { id: "491", section: "Section 491", title: "Counterfeiting valuable securities", description: "Counterfeiting securities is punishable." },
  { id: "492", section: "Section 492", title: "Counterfeiting with intent to cheat", description: "Counterfeiting intending to cheat is punishable." },
  { id: "493", section: "Section 493", title: "Counterfeiting for wrongful gain", description: "Counterfeiting to gain is punishable." },
  { id: "494", section: "Section 494", title: "Marrying again during lifetime of spouse", description: "Bigamy is punishable." },
  { id: "495", section: "Section 495", title: "Marriage by person with spouse living", description: "Marrying while spouse is alive is punishable." },
  { id: "496", section: "Section 496", title: "Bigamy", description: "Marrying another person while one spouse is alive is punishable." },
  { id: "497", section: "Section 497", title: "Adultery", description: "Sexual intercourse with another’s spouse without consent is punishable." },
  { id: "498", section: "Section 498", title: "Enticing or taking away or detaining with criminal intent a married woman", description: "Enticing or taking away a married woman to commit offence is punishable." },
  { id: "498A", section: "Section 498A", title: "Husband or relative of husband of a woman subjecting her to cruelty", description: "Subjecting a woman to cruelty is punishable." },
  { id: "499", section: "Section 499", title: "Defamation", description: "Making false statements harming reputation is punishable." },
  { id: "500", section: "Section 500", title: "Punishment for defamation", description: "Defamation is punishable with imprisonment or fine." },
  { id: "501", section: "Section 501", title: "Printing or engraving matter known to be defamatory", description: "Printing defamatory material is punishable." },
  { id: "502", section: "Section 502", title: "Sale of printed or engraved matter known to be defamatory", description: "Selling defamatory material is punishable." },
  { id: '499', section: 'Section 499', title: 'Defamation', description: 'Whoever, by words either spoken or intended to be read, or by signs or by visible representations, makes or publishes any imputation concerning any person intending to harm, or knowing or having reason to believe that such imputation will harm, the reputation of such person, is said, except in the cases hereinafter excepted, to defame that person.' }
];

const IPCPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return ipcData.filter(
      item =>
        item.section.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="dashboard animate-in">
      <style>
        {`
          .ipc-page-container {
             display: flex;
             flex-direction: column;
             gap: 2rem;
             padding-bottom: 4rem;
          }
          .ipc-header-wrap {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
            background: linear-gradient(180deg, rgba(8, 12, 18, 0.9), rgba(12, 18, 26, 0.4));
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 1.5rem;
            padding: 2.5rem;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            position: relative;
            overflow: hidden;
          }
          .ipc-header-wrap::after {
            content: '';
            position: absolute;
            top: -50%; left: -50%; width: 200%; height: 200%;
            background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent 50%);
            pointer-events: none;
            z-index: 0;
          }
          .ipc-header-content {
            z-index: 1;
            width: 100%;
          }
          .ipc-gradient-text {
            background: linear-gradient(90deg, #60a5fa, #34d399);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 800;
          }
          .ipc-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 2rem;
            perspective: 1000px;
          }
          .ipc-card {
            position: relative;
            background: linear-gradient(145deg, rgba(20, 26, 36, 0.9) 0%, rgba(10, 14, 20, 0.8) 100%);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 1.25rem;
            padding: 2rem;
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            height: 100%;
            transform-style: preserve-3d;
          }
          .ipc-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            border-radius: 1.25rem;
            padding: 2px;
            background: linear-gradient(135deg, rgba(96, 165, 250, 0.8), rgba(52, 211, 153, 0.3), transparent 60%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0;
            transition: opacity 0.5s ease;
          }
          .ipc-card:hover {
            transform: translateY(-8px) scale(1.03) rotateX(2deg) rotateY(-2deg);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(59, 130, 246, 0.2);
            background: linear-gradient(145deg, rgba(28, 36, 50, 0.95) 0%, rgba(12, 16, 24, 0.9) 100%);
          }
          .ipc-card:hover::before {
            opacity: 1;
          }
          .ipc-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.4rem 1rem;
            border-radius: 2rem;
            background: rgba(59, 130, 246, 0.1);
            color: #93c5fd;
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 1.25rem;
            border: 1px solid rgba(96, 165, 250, 0.2);
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.15) inset;
            width: fit-content;
          }
          .ipc-title {
            font-weight: 800;
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: #f1f5f9;
            line-height: 1.3;
            letter-spacing: -0.01em;
          }
          .ipc-desc {
            color: #94a3b8;
            font-size: 0.95rem;
            line-height: 1.7;
            flex-grow: 1;
            font-weight: 400;
            overflow: auto;
            position: relative;
          }
          .ipc-back-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 2rem;
            padding: 0.6rem 1.2rem;
            color: #e2e8f0;
            font-size: 0.875rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
          }
          .ipc-back-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateX(-3px);
            color: #fff;
          }
          .ipc-search {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(96, 165, 250, 0.3);
            border-radius: 2rem;
            padding: 0.8rem 1.5rem;
            color: #fff;
            font-size: 1rem;
            outline: none;
            width: 100%;
            max-width: 600px;
            transition: all 0.3s ease;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5) inset;
          }
          .ipc-search:focus {
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 0 20px rgba(0, 0, 0, 0.5) inset;
            background: rgba(0, 0, 0, 0.4);
          }
          .ipc-search::placeholder {
            color: #64748b;
          }
          .ipc-empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 6rem 2rem;
            background: rgba(15, 20, 30, 0.6);
            border-radius: 1.5rem;
            border: 1px dashed rgba(255, 255, 255, 0.1);
            color: #64748b;
            font-size: 1.1rem;
            font-weight: 500;
          }
        `}
      </style>

      <div className="ipc-page-container">
        <header className="ipc-header-wrap">
          <div className="ipc-header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2.2rem' }}>⚖️</span>
                <span>Indian Penal Code <span className="ipc-gradient-text">Pro</span></span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.5 }}>
                An elegant, highly optimized reference matrix for the pivotal sections of the Indian Penal Code.
              </p>
            </div>
            <Link to="/" className="ipc-back-btn">
              <span>←</span> Back Home
            </Link>
          </div>

          <div className="ipc-header-content" style={{ marginTop: '0.5rem' }}>
            <input
              type="text"
              className="ipc-search"
              placeholder="Search sections by number, keyword, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <section className="ipc-grid">
          {filteredData.map((item) => (
            <div key={item.id} className="ipc-card">
              <div className="ipc-badge">{item.section}</div>
              <h4 className="ipc-title">{item.title}</h4>
              <p className="ipc-desc">{item.description}</p>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="ipc-empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🔍</div>
              No sections found matching "{searchQuery}"
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default IPCPage;
