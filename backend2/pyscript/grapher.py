
import json
import os
from functools import lru_cache
from rdflib import Graph
from pyscript.rdfquery import rdfQueries as asker
from typing import List, Dict, Any, Optional
from datetime import datetime

# --- The knowledge graph file (single source of truth) ---
# Resolved relative to this file so the app works from any working directory.
# Override with the RESUME_GRAPH_PATH environment variable if needed.
GRAPH_PATH = os.environ.get(
    "RESUME_GRAPH_PATH",
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "database", "resume.ttl"),
)


@lru_cache(maxsize=1)
def load_graph() -> Graph:
    """Parses the TTL file once and reuses the in-memory graph for every request."""
    graph = Graph()
    graph.parse(GRAPH_PATH, format="turtle")
    return graph

class graphData:
    """ this class retrieves information from the database"""

    def __init__(self, selectedName):
        self.graph = load_graph()
        self.name_list = []
        self.name = ""
        self.selectedName = selectedName
        self.nameURI = ""

        self.get_Persons()


    def run_query(self, query_string: str, caller: str) -> Optional[Dict[str, Any]]:
        """
        Runs a SPARQL query against the in-memory graph.

        Returns:
            results in the standard SPARQL JSON shape ({"results": {"bindings": [...]}}),
            or None if the query fails.
        """
        try:
            return json.loads(self.graph.query(query_string).serialize(format="json"))
        except Exception as e:
            print(f"Error querying graph {GRAPH_PATH} for {caller}: {e}")
            return None

    def aggregate_by_keys(self, data: List[Dict[str, Any]], group_keys: List[str]) -> List[Dict[str, Any]]:
        """
        Groups a list of dictionaries by multiple specified keys and consolidates 
        the values of all other keys into unique lists.

        Args:
            data: The input list of dictionaries.
            group_keys: A list of keys used to group the dictionaries (e.g., ['label', 'country']).

        Returns:
            A list of aggregated dictionaries with consolidated values as lists.
        """
        aggregated_data = {}

        for item in data:
            # 1. Create a unique, immutable key (a tuple) from the values of the group_keys
            group_id = tuple(item[key] for key in group_keys)

            if group_id not in aggregated_data:
                # If this is the first time seeing this group combination, initialize
                
                # The initial structure includes the group_keys and sets up unique sets for others
                aggregated_data[group_id] = {}
                
                # Copy the grouping keys and values into the result dict
                for key in group_keys:
                    aggregated_data[group_id][key] = item[key]
                
                # Initialize all other keys as sets for automatic uniqueness checking
                for k, v in item.items():
                    if k not in group_keys:
                        aggregated_data[group_id][k] = {v}
            else:
                # If the group combination is already present, consolidate the remaining keys
                current_group = aggregated_data[group_id]
                for k, v in item.items():
                    if k not in group_keys:
                        # Use .add() on the set to ensure uniqueness
                        current_group[k].add(v)

        # 2. Convert the aggregated dictionary (containing sets) back into the desired list format
        final_list = []
        for group_id, group_dict in aggregated_data.items():
            result_item = {key: group_dict[key] for key in group_keys} # Start with group keys
            
            # Convert the sets back into sorted lists for the final output
            for k, v_set in group_dict.items():
                if k not in group_keys:
                    result_item[k] = list(v_set) 
            
            final_list.append(result_item)
            
        return final_list

    def get_Persons(self):
        """
        retrieves all the persons present in the database

        
        Returns:
            A list of persons available in database.
        """
        # 1. Construct the full SPARQL query
        query_string = "".join([asker.get_prefix(), asker.get_person_query()])
        
        # 2. Execute the query against the graph
        results = self.run_query(query_string, "get_persons")
        if results is None:
            return
        
        # 4. Process the results
        for row in results["results"]["bindings"]:
            # Extract category name from the full URI
            self.name_list.append(str(row['person_name']['value']))

    def get_name(self):
        """
        selects the name of the person to be shown in the front end

        
        Returns:
            a string containing the user to be shoen on the frontend.
        """
        for entry in self.name_list:
            if entry == self.selectedName:
                self.name = entry


    def get_personDetails(self):
        """
        gets the details for the abouts page of this person selected

        
        Returns:
            a list of one dictionary.
        """
        # 1. Construct the full SPARQL query
        query_string = "".join([asker.get_prefix(), asker.get_person_detail_query()]).format(person_name=self.name)
        
        # 2. Execute the query against the graph
        results = self.run_query(query_string, "get_personDetails")
        if results is None:
            return
        
        # 4. Process the results
        Detail = []        
        for row in results["results"]["bindings"]:
            Detail.append({
               'personURI':  str(row['personURI']['value']),
               'dob':  self.format_date_string(str(row['dob']['value']), 'day_month_year') if 'dob' in row  else '',
               'address':  str(row['address']['value']) if 'address' in row else '',
               'emailAddress':  str(row['emailAddress']['value']) if 'emailAddress' in row else '',
               'phoneNumber':  str(row['phoneNumber']['value']) if 'phoneNumber' in row else '',
               'roleTitle' : str(row['roleTitle']['value']),
               'aboutMe' : str(row['aboutMe']['value']) if 'aboutMe' in row else '',
               'photo' : str(row['photo']['value']) if 'photo' in row else ''
            })
        
        self.nameURI = Detail[0]['personURI']
        return Detail


    def get_workExperience(self):
        """
        returns a list of dictionaries containing all wprk experiences by the selected Name

        
        Returns:
            a list of dictionaries.
        """
        # 1. Construct the full SPARQL query
        query_string = "".join([asker.get_prefix(), asker.get_experience_query()]).format(person=self.nameURI)
        
        # 2. Execute the query against the graph
        results = self.run_query(query_string, "get_workExperience")
        if results is None:
            return

        # 4. Process the results
        WorkExperience = []
        for row in results["results"]["bindings"]:
            WorkExperience.append({
                'main': str(row['experience']['value']),
                'workTitle': str(row['workTitle']['value']),
                'industryName': str(row['industryName']['value']),
                'city': self.process_uri_fragment(str(row['city']['value'])),
                'country': self.process_uri_fragment(str(row['country']['value'])),
                'startDate': self.format_date_string(str(row['startDate']['value']), 'year'),
                'endDate': self.format_date_string(str(row['endDate']['value']), 'year') if 'endDate' in row else 'Present',
                'dutyDescription': str(row['dutyDescription']['value']),
                'category': self.process_uri_fragment(str(row['category']['value'])) if 'category' in row else ''
                })
        
        jsonWorkExperience = self.aggregate_by_keys(WorkExperience, ['main'])            
        return jsonWorkExperience
    

    def get_Education(self):
        """
        returns a list of dictionaries containing all wprk experiences by the selected Name

        
        Returns:
            a list of dictionaries.
        """    
        # 1. Construct the full SPARQL query
        query_string = "".join([asker.get_prefix(), asker.get_education_query()]).format(person=self.nameURI)
        
        # 2. Execute the query against the graph
        results = self.run_query(query_string, "get_education")
        if results is None:
            return
        
        # 4. Process the results
        Education = []
        for row in results["results"]["bindings"]:
            Education.append({
                'main': str(row['education']['value']),
                'schoolName': str(row['schoolName']['value']),
                'degreeTitle': str(row['degreeTitle']['value']),
                'city': self.process_uri_fragment(str(row['city']['value'])),
                'country': self.process_uri_fragment(str(row['country']['value'])),
                'grade': str(row['grade']['value']) if 'grade' in row else '',
                'endDate': self.format_date_string(str(row['endDate']['value']), 'month_year') if 'endDate' in row else 'Present',
                'startDate': self.format_date_string(str(row['startDate']['value']), 'month_year'),
                'gradeVal': str(row['gradeVal']['value']) if 'gradeVal' in row else ''
                })
        
        jsonEducation = self.aggregate_by_keys(Education, ['main'])
        return jsonEducation
    

    def get_skill(self):
        """
        returns a list of dictionaries containing all wprk experiences by the selected Name

        
        Returns:
            a list of dictionaries.
        """
        # 1. Construct the full SPARQL query
        query_string = "".join([asker.get_prefix(), asker.get_skill_query()]).format(person=self.nameURI)
        
        # 2. Execute the query against the graph
        results = self.run_query(query_string, "get_skill")
        if results is None:
            return
        
        # 4. Process the results
        Skill = []
        for row in results["results"]["bindings"]:
            Skill.append({
                'main': str(row['skill']['value']),
                'skillTitle': str(row['skillTitle']['value']),
                'category': self.process_uri_fragment(str(row['category']['value'])) if 'category' in row else '',
                'typename': str(row['typename']['value']),
                'percentageScore': str(row['percentageScore']['value']),
                'percentage': str(row['percentage']['value']),
                'skillDescription': str(row['skillDescription']['value']) if 'skillDescription' in row else ''        
        })
            
        jsonSkill = self.aggregate_by_keys(Skill, ['main'])            
        return jsonSkill
    
    def get_skill_types(self):
        """
        returns a list of dictionaries containing all skill types by the selected Name

        
        Returns:
            a list of dictionaries.
        """
        # 1. Construct the full SPARQL query
        query_string = "".join([asker.get_prefix(), asker.get_skill_type()]).format(person=self.nameURI)
        
        # 2. Execute the query against the graph
        results = self.run_query(query_string, "get_skill_types")
        if results is None:
            return
        
        # 4. Process the results
        SkillType = []
        for row in results["results"]["bindings"]:
            SkillType.append({
                'main': str(row['skillLabel']['value'])               
        })
        
        jsonSkillType = self.aggregate_by_keys(SkillType, ['main'])
        return jsonSkillType
    

    def get_certifications(self):
        """
        returns a list of dictionaries containing all certifications gotten by the selected Name

        
        Returns:
            a list of dictionaries.
        """
        # 1. Construct the full SPARQL query
        query_string = "".join([asker.get_prefix(), asker.get_achievement_query()]).format(person=self.nameURI)
        
        # 2. Execute the query against the graph
        results = self.run_query(query_string, "get_certifications")
        if results is None:
            return
        
        # 4. Process the results
        Certificate = []
        for row in results["results"]["bindings"]:
            Certificate.append({
                'main': str(row['achievement']['value']),
                'certTitle': str(row['certTitle']['value']),
                'endDate': self.format_date_string(str(row['endDate']['value']), 'month_year') if 'endDate' in row else '',
                'link': str(row['link']['value']) if 'link' in row else '',                
                'category': self.process_uri_fragment(str(row['category']['value'])) if 'category' in row else ''        
        })
            
        jsonCertificate = self.aggregate_by_keys(Certificate, ['main'])
        return jsonCertificate
    

    def get_projects(self):
        """
        returns a list of dictionaries containing all projects by the selected Name

        Returns:
            a list of dictionaries.
        """
        # 1. Construct the full SPARQL query
        query_string = "".join([asker.get_prefix(), asker.get_project_query()]).format(person=self.nameURI)
        
        # 2. Execute the query against the graph
        results = self.run_query(query_string, "get_projects")
        if results is None:
            return
        
        # 4. Process the results
        Project = []
        for row in results["results"]["bindings"]:
            Project.append({
                'main': str(row['project']['value']),
                'projectTitle': str(row['projectTitle']['value']),
                'projectClass': str(row['projectClass']['value']) if 'projectClass' in row else '',
                'projectDescription': str(row['projectDescription']['value']) if 'projectDescription' in row else '',
                'projectLink': str(row['projectLink']['value']) if 'projectLink' in row else '#',                 
                'category': self.process_uri_fragment(str(row['category']['value'])) if 'category' in row else ''       
        })
            
        jsonProject = self.aggregate_by_keys(Project, ['main'])
        return jsonProject
    

    def get_project_class(self):
        """
        returns a list of dictionaries containing all project classes done by the selected Name
        
        Returns:
            a list of dictionaries.
        """
        # 1. Construct the full SPARQL query
        query_string = "".join([asker.get_prefix(), asker.get_project_class_query()]).format(person=self.nameURI)
        
        # 2. Execute the query against the graph
        results = self.run_query(query_string, "get_project_class")
        if results is None:
            return
        
        # 4. Process the results
        ProjectClass = []
        for row in results["results"]["bindings"]:
            ProjectClass.append({
                'main': str(row['projectClass']['value'])                
        
        })
        
        jsonProjectClass = self.aggregate_by_keys(ProjectClass, ['main'])
        return jsonProjectClass
    

    def get_services(self):
        """
        returns a list of dictionaries containing all projects by the selected Name

        Returns:
            a list of dictionaries.
        """
        # 1. Construct the full SPARQL query
        query_string = "".join([asker.get_prefix(), asker.get_service_query()]).format(person=self.nameURI)
        
        # 2. Execute the query against the graph
        results = self.run_query(query_string, "get_services")
        if results is None:
            return

        # 4. Process the results        
        Services = []
        for row in results["results"]["bindings"]:
            Services.append({
                'main': str(row['service']['value']),
                'serviceTitle': str(row['serviceTitle']['value']),
                'serviceText': str(row['serviceText']['value']) if 'serviceText' in row else '',
                'serviceImage': str(row['serviceImage']['value']) if 'serviceImage' in row else ''                      
        })
            
        jsonServices = self.aggregate_by_keys(Services, ['main'])
        return jsonServices
    

    def get_socials(self):
        """
        returns a list of dictionaries containing all social media accounts by the selected Name

        Returns:
            a list of dictionaries.
        """
        # 1. Construct the full SPARQL query
        query_string = "".join([asker.get_prefix(), asker.get_social_query()]).format(person=self.nameURI)
        
        # 2. Execute the query against the graph
        results = self.run_query(query_string, "get_socials")
        if results is None:
            return

        # 4. Process the results
        Social = []
        for row in results["results"]["bindings"]:
            Social.append({
                'main': str(row['social']['value']),
                'socialType': self.process_uri_fragment(str(row['socialType']['value'])),
                'socialLink': str(row['socialLink']['value'])
        })
            
        jsonSocial = self.aggregate_by_keys(Social, ['main'])
        return jsonSocial
    
    def get_categories(self):
        """
        returns a list of dictionaries containing all social media accounts by the selected Name

        Returns:
            a list of dictionaries.
        """
        # 1. Construct the full SPARQL query
        query_string = "".join([asker.get_prefix(), asker.get_category_query()]).format(person=self.nameURI)
        
        # 2. Execute the query against the graph
        results = self.run_query(query_string, "get_category")
        if results is None:
            return

        # 4. Process the results
        Category = []
        for row in results["results"]["bindings"]:
            Category.append({
                'main': self.process_uri_fragment(str(row['category']['value']))                
                                       
        })
            
        jsonCategory = self.aggregate_by_keys(Category, ['main'])
        return jsonCategory
    

    def process_uri_fragment(self, value: Any) -> str:
        """
        Strips the full URI to only the last segment after the final slash ('/') 
        unless the value appears to be a full, live link (contains '://').

        Args:
            value: The input value, typically a string or a URI object.

        Returns:
            The full link, or the stripped fragment, as a string.
        """
        # 1. Convert the input value to a string if it's not already
        s = str(value)
                
        # 3. If it's not a full link, check for the presence of a slash.
        if "http://www.semanticweb.org/uzoma/ontologies/2025/9/resume/" in s:
            # Split the string by the last occurrence of '/' and return the part after it.
            # Example: 'resume/NwiwuUzoma' becomes 'NwiwuUzoma'
            return s.split('/')[-1]
        
        # 4. If no '/' is found and it's not a full link, return the original string.
        return s
    

    def format_date_string(self, date_string: Optional[str], format_type: str = 'month_year') -> str:
        """
        Converts a date string (e.g., "YYYY-MM-DDT...") into a specific human-readable format.

        Args:
            date_string: The date string to convert (e.g., "2025-09-15T00:00:00").
                        Can be None, in which case an empty string is returned.
            format_type: The desired output format. 
                        Options: 'day_month_year' (e.g., "15 September, 2025") 
                                'month_year' (e.g., "September, 2025") 
                                'year' (e.g., "2025").

        Returns:
            The formatted date string, or an empty string if input is None/empty.
        """
        if not date_string:
            return ""
        
        # Clean the string to only include the date part (YYYY-MM-DD)
        date_part = date_string.split('T')[0]

        # 1. Parse the date string into a datetime object
        try:
            dt_object = datetime.strptime(date_part, '%Y-%m-%d')
        except ValueError:
            return "Invalid Date Format"

        # 2. Format the datetime object based on the requested type
        if format_type == 'day_month_year':
            # %d = Day of the month as a zero-padded decimal number
            # %B = Full month name
            # %Y = Full year
            return dt_object.strftime('%d %B, %Y')
        
        elif format_type == 'month_year':
            # %B = Full month name
            return dt_object.strftime('%B, %Y')
        
        elif format_type == 'year':
            return dt_object.strftime('%Y')
            
        else:
            raise ValueError("Invalid format_type. Use 'day_month_year', 'month_year', or 'year'.")

