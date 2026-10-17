
class rdfQueries:
    # collection of queries for all computation

    def __init__():
        pass

    @staticmethod
    def get_prefix():

        prefix = """
        PREFIX : <http://www.semanticweb.org/uzoma/ontologies/2025/9/resume/>
        PREFIX res: <http://www.semanticweb.org/uzoma/ontologies/2025/9/resume#>
        PREFIX dc: <http://purl.org/dc/elements/1.1/> 
        PREFIX owl: <http://www.w3.org/2002/07/owl#> 
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
        PREFIX xml: <http://www.w3.org/XML/1998/namespace> 
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
        PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 

        """
        return prefix
    

    def get_person_query():

        Query_Person = """

            SELECT ?person_name
            WHERE {
                ?person rdf:type foaf:Person ;
                rdfs:label ?person_name .
                    
            }
        """
        return Query_Person
    

    def get_person_detail_query():

        Query_person_detail = """

            SELECT ?personURI ?dob ?address ?emailAddress ?phoneNumber ?roleTitle ?aboutMe ?photo
            WHERE {{
                 ?personURI :hasAddress ?address ;
                    rdfs:label "{person_name}" ;                    
                    foaf:title ?roleTitle .

                    OPTIONAL {{ ?personURI dc:description ?aboutMe }} . 
                    OPTIONAL {{ ?personURI foaf:status ?photo }} .  
                    OPTIONAL {{ ?personURI foaf:birthday ?dob }} .
                    OPTIONAL {{ ?personURI :hasPhone ?phoneNumber }} .  
                    OPTIONAL {{ ?personURI :hasEmail ?emailAddress }} .                
            }}
        """
        return Query_person_detail
    
    def get_education_query():

        Query_Education = """

            SELECT ?education ?schoolName ?city ?country ?endDate ?startDate ?grade ?gradeVal ?degreeTitle
            WHERE {{
                <{person}> :hasEducation ?education .

                ?education :doneAt ?school ;
            :hasCourse ?course ;            
            :startDate ?startDate .

            ?school :locatedIn ?cityName ;
                foaf:title ?schoolName .

            ?cityName :locatedIn ?country ;
            rdfs:label  ?city.

            ?course :degreeLevel ?degree .   
                 
            ?degree foaf:title ?degreeTitle .

            OPTIONAL {{ ?education :endDate ?endDate }} .
            OPTIONAL {{ ?degree :hasGrade ?grade }} .
            OPTIONAL {{ ?degree :hasGradeValue ?gradeVal }} .
            }}            
            ORDER BY ASC(BOUND(?endDate)) DESC(?endDate)
        """
        return Query_Education
    

    def get_experience_query():


        Query_Experience = """

            SELECT ?experience ?workTitle ?industryName ?city ?country ?endDate ?startDate ?dutyDescription ?dutyRow ?category
            WHERE {{
                <{person}> :hasExperience ?experience .

                ?experience :doneAt ?industry ;                 
                :hasDuty ?duty ;                
                :startDate ?startDate ;
                foaf:title ?workTitle .

                ?industry :locatedIn ?cityName ;
                foaf:title ?industryName.

                ?cityName :locatedIn ?country ;
                rdfs:label  ?city.

                ?duty foaf:title ?dutyDescription.

            OPTIONAL {{ ?duty res:hasRow ?dutyRow }} .
            OPTIONAL {{ ?experience :endDate ?endDate }} .
            OPTIONAL {{ ?experience :hasCategory ?category }} .
            }}            
            ORDER BY ASC(BOUND(?endDate)) DESC(?endDate)
        """
        return Query_Experience
    

    def get_skill_query():

        Query_Skill = """

            SELECT ?skill ?skillTitle ?category ?percentageScore ?percentage ?skillDescription ?typename ?partTitle ?partDescription
            WHERE {{
                <{person}> :hasSkill ?skill.

                ?skill rdf:type ?skillType ;
                    :hasPercentage ?percentage ;
                    foaf:status ?percentageScore ;
                    foaf:title ?skillTitle .

                ?skillType rdfs:subClassOf :Skills ;
                 rdfs:label ?typename .

                OPTIONAL {{ ?skill :hasCategory ?category }} .
                OPTIONAL {{ ?skill dc:description ?skillDescription }} .
                OPTIONAL {{ ?skill res:dividedInto ?part .
                         ?part foaf:title ?partTitle .
                         OPTIONAL {{ ?part dc:description ?partDescription }} }} .

            }}
            ORDER BY ?partTitle

        """
        return Query_Skill
    
    def get_skill_type():
        Query_Skill_Types = """

        Select DISTINCT ?skillLabel
        WHERE {{
            ?skill rdf:type owl:Class ;
              rdfs:subClassOf :Skills ;
              rdfs:label ?skillLabel .

            ?specSkill rdf:type ?skill.

            <{person}> :hasSkill  ?specSkill .
              }}
        """
        return Query_Skill_Types
    
    def get_achievement_query():

        Query_Achievement = """

            SELECT ?achievement ?certTitle ?endDate ?link ?category
            WHERE {{
                <{person}> :hasAchievement ?achievement .

                ?achievement foaf:title ?certTitle .    

                OPTIONAL {{ ?achievement :endDate ?endDate }} .
                OPTIONAL {{ ?achievement :hasLink ?link }} .
                OPTIONAL {{ ?achievement :hasCategory ?category }} .
            }}
            ORDER BY ASC(BOUND(?endDate)) DESC(?endDate)
        """
        return Query_Achievement
    
    def get_project_class_query():

        Query_Project_Class = """

            SELECT ?projectClass
            WHERE {{
                <{person}> :hasProject ?project .

                ?project rdf:type  foaf:Project ;
                    foaf:theme ?projectClassURI .             

                ?projectClassURI rdfs:label ?projectClass.
            }}
            
        """
        return Query_Project_Class
    

    def get_project_query():

        Query_Project = """

            SELECT ?project ?projectTitle ?projectClass ?projectDescription ?category ?projectLink
            WHERE {{
                <{person}> :hasProject ?project .

                ?project rdf:type  foaf:Project ;                   
                    foaf:title ?projectTitle.

                OPTIONAL {{ ?project foaf:theme ?projectClassURI.
                         ?projectClassURI rdfs:label ?projectClass.}} .
                OPTIONAL {{ ?project :hasCategory ?category }} .
                OPTIONAL {{ ?project dc:description ?projectDescription }} .
                OPTIONAL {{ ?project :hasLink ?projectLink }} .
                OPTIONAL {{ ?project res:hasRow ?projectRow }} .
            }}
            ORDER BY DESC(?projectRow)

        """
        return Query_Project
    
    def get_service_query():

        Query_Service = """

            SELECT ?service ?serviceText ?serviceTitle ?serviceImage
            WHERE {{
                <{person}> :provideService ?service .

                ?service    dc:description ?serviceText ;
                    foaf:title ?serviceTitle .
                    
                OPTIONAL {{ ?service foaf:status ?serviceImage }} .
            
            }}
            
        """
        return Query_Service

    
    def get_social_query():

        Query_Social = """

            SELECT ?social ?socialType ?socialLink 
            WHERE {{
                <{person}> :hasSocial ?social.

                ?social rdf:type :Socials ;
                    foaf:title ?socialType ;
                    :hasLink ?socialLink .

                }}
        """
        return Query_Social
    

    def get_category_query():

        Query_Category = """

            SELECT DISTINCT ?category 
            WHERE {{                
                <{person}> ?personRelation ?intermediateNode .
                ?intermediateNode :hasCategory ?category .
                ?category rdf:type :Entry_type.

                FILTER (?personRelation IN (:hasExperience, :hasSkill, :hasAchievement, :hasProject))
                }}
        """
        return Query_Category    

"""

?category rdf:type 
                
                <{person}> :hasExperience|:hasSkill|:hasAchievement|:hasproject / :hasCategory ?category .
                """

